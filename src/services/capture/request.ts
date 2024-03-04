import { toHexString } from 'ictool';
import { decode as cborDecode } from 'cbor-x';
import { ReadRequest, CallRequest, Expiry, requestIdOf } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { decodeCandidArgs } from '../candid';
import { base64ToBytes, asPrincipal } from '../common';
import { ActorHelper } from '../../api/actors';

export type RequestType = 'query' | 'call' | 'read_state';
type InternetComputerRequest = ReadRequest | CallRequest;

interface AbstractDecodedRequest {
    message: string;
    requestId: string;
    canisterId: string;
    method: string;
    sender: Principal;
    requestType: RequestType;
    ingressExpiry: Expiry;
    boundary: URL;
    size?: number;
    stack?: SimplifiedStack[];
    actorHelper: ActorHelper;
}

export interface DecodedCallRequest extends AbstractDecodedRequest {
    paths: ArrayBuffer[][];
}

// TODO: This type poorly thought out. "Read" seems to indicate "read_state", but that request type has no args param.
export interface DecodedReadRequest extends AbstractDecodedRequest {
    args: {
        result: any;
        withInterface: boolean;
    };
}

export type DecodedRequest = DecodedCallRequest | DecodedReadRequest;

// A read_state requests doesn't include critical information about the original call request, so we track this data in memory.
export const messageDetails: {
    [key: string]: {
        canisterId: string;
        method: string;
    };
} = {};

/**
 * Decode the body of an internet computer request.
 */
export async function decodeRequest(
    event: chrome.devtools.network.Request,
): Promise<DecodedRequest> {
    if (!event.request.postData?.text) {
        throw new Error('Could not retrieve post data for request');
    }

    const requestText = event.request.postData.text;

    // Chrome encodes the string into a latin character set. We reverse that.
    const b64 = window.btoa(requestText);

    // The network request text is a B64 encoded string. We decode to bytes.
    const bytes = base64ToBytes(b64);

    // The resulting bytes are encoded in CBOR. We decode to an InternetComputerRequest.
    const result: { content: InternetComputerRequest } = cborDecode(bytes);

    // Validate the decoded content (not even sure where the content key comes from...)
    if (!('content' in result)) {
        console.error(result);
        throw new Error(
            `Unreachable: unexpected missing "content" key in decode.`,
        );
    }

    // Validate the request.
    const request = result.content;
    console.log(request);
    if (
        !('request_type' in request) ||
        !['query', 'call', 'read_state'].includes(request.request_type)
    ) {
        console.error('Unexpected request', request);
        throw new Error(`Unreachable: unexpected result decoded from request.`);
    }

    // Following parameters are common to all request types.
    const sender = asPrincipal(request.sender);
    const requestType = request.request_type;
    const ingressExpiry = request.ingress_expiry;
    const requestId = toHexString([...new Uint8Array(requestIdOf(request))]);
    const boundary = new URL(event.request.url);
    const actorHelper = new ActorHelper(boundary);
    const size =
        event.request.bodySize > -1 ? event.request.bodySize : undefined;
    const stack = extractTrace(event);

    if (requestType === 'query' || requestType === 'call') {
        // These parameters common to "call" and "query" requests.
        const canisterId = asPrincipal(request.canister_id).toText();
        const method = request.method_name;

        // This parameter allows us to determine which original ic message a request is concerned with
        const message = requestId;
        // NOTE: Bad side effect. Why does putting this below the next await cause the value not to be set when accessed in decodeRequest?
        messageDetails[message] = {
            canisterId: canisterId,
            method,
        };
        const args = await decodeCandidArgs(canisterId, method, request.arg, actorHelper);

        return {
            boundary,
            message,
            requestId,
            sender,
            requestType,
            ingressExpiry,
            canisterId,
            method,
            args,
            size,
            stack,
            actorHelper
        };
    } else {
        // These parameters only on "read_state" requests
        const paths = request.paths;
        let method;
        let canisterId;
        let message;
        if (request.paths[0].length <= 1) {
            throw new Error('Unexpected empty paths in read_state request');
        } else {

            // The lookup path provided in "read_state" request is the requestId of the original "call" request
            message = toHexString([...new Uint8Array(request.paths[0][1])]);

            let info = messageDetails[message];
            method = info.method;
            canisterId = info.canisterId;
        }
        return {
            boundary,
            message,
            requestId,
            canisterId,
            method,
            sender,
            requestType,
            ingressExpiry,
            paths,
            size,
            stack,
            actorHelper
        };
    }
}

interface CallFrame {
    functionName: string;
    url: string;
    lineNumber: number;
    columnNumber: number;
}

interface StackObject {
    callFrames: CallFrame[];
    parent?: StackObject;
    description?: string;
}

interface SimplifiedStack {
    functionName: string;
    fullPath: string;
    lineNumber: number;
    fileName: string;
    columnNumber: number;
}

// This signature is based on a data stub extracted from Chrome version 114.0.5735.198
function extractTrace(
    request: chrome.devtools.network.Request,
): SimplifiedStack[] {
    const simplified: SimplifiedStack[] = [];

    if (!request._initiator) return simplified;
    const initiator = request._initiator as unknown as any;

    if (!('stack' in initiator)) return simplified;
    let stack: StackObject | undefined = initiator.stack;

    while (stack) {
        for (const frame of stack.callFrames) {
            const simplifiedFrame = {
                functionName: frame.functionName,
                fullPath: frame.url,
                lineNumber: frame.lineNumber,
                fileName: new URL(frame.url).pathname,
                columnNumber: frame.columnNumber,
            };
            simplified.push(simplifiedFrame);
        }

        stack = stack.parent;
    }

    return simplified;
}
