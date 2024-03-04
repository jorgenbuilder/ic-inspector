import {
    QueryResponseStatus,
    RequestStatusResponseStatus,
    Certificate,
    HttpAgent,
} from '@dfinity/agent';
import { decode as cborDecode } from 'cbor-x';
import { CandidDecodeResult, decodeCandidVals } from '../candid';
import { base64ToBytes } from '../common';
import {
    DecodedRequest,
    DecodedReadRequest,
    messageDetails,
    DecodedCallRequest,
} from './request';
import { ActorHelper } from '../../api/actors';

interface AbstractDecodedResponse {
    size?: number;
}

interface DecodedQueryResponse extends AbstractDecodedResponse {
    status: QueryResponseStatus;
}

interface RepliedQueryResponse extends DecodedQueryResponse {
    reply: CandidDecodeResult;
}

export interface RejectedResponse extends DecodedQueryResponse {
    message: string;
    code: number;
}

interface DecodedReadStateResponse extends AbstractDecodedResponse {
    status: RequestStatusResponseStatus;
}

interface RepliedReadStateResponse extends DecodedReadStateResponse {
    reply: CandidDecodeResult;
}

export type DecodedResponse =
    | DecodedQueryResponse
    | RepliedQueryResponse
    | DecodedReadStateResponse
    | RepliedReadStateResponse
    | RejectedResponse;

export async function decodeResponse(
    event: chrome.devtools.network.Request,
    request: DecodedRequest,
    actorHelper: ActorHelper
): Promise<DecodedResponse> {
    // We retrieve the response text through chrome's async api
    const content = (await new Promise<string>((res) =>
        event.getContent((content) => res(content)),
    )) as string | undefined;

    if (!content) {
        console.warn(
            `Received empty response. This is expected for empty 202 call responses, and http_request, but there may be other unknown cases.`,
        );
        return { status: RequestStatusResponseStatus.Unknown };
    }

    const size =
        event.response.content.size > -1
            ? event.response.content.size
            : undefined;

    // The resulting content is a B64 encoded string. We decode to byes.
    const bytes = base64ToBytes(content);

    // The resulting bytes are encoded in CBOR. We decode to an InternetComputerResponse.
    const response = cborDecode(bytes);

    // Validate the response
    if (
        !response ||
        (!('status' in response) &&
            !('certificate' in response) &&
            !('requestId' in response))
    ) {
        console.error('Unexpected response', response, event);
        throw new Error(
            `Unreachable: unexpected result decoded from response.`,
        );
    }

    if ('status' in response) {
        // Validate we have corresponding query request
        if (request.requestType !== 'query') {
            throw new Error(
                'Unreachable: query response follows query request.',
            );
        }
        const { canisterId, method } = request as DecodedReadRequest;

        // These parameters exist on query response
        const status = response.status;
        if (status === 'replied') {
            // These parameters exist on successful query response
            const reply = await decodeCandidVals(
                canisterId,
                method,
                response.reply.arg,
                actorHelper
            );
            return { status, reply, size };
        } else {
            // These parameters exist on failed query response
            const message = response.reject_message;
            const code = response.reject_code;
            return { status, message, code, size };
        }
    } else if ('certificate' in response) {
        // Validate we have corresponding read_state request
        if (request.requestType !== 'read_state') {
            throw new Error(
                'Unreachable: read_state response follows read_state request.',
            );
        }
        const { paths, message } = request as DecodedCallRequest;

        // Validate the request path
        const p1 = new TextDecoder().decode(paths[0][0]);
        if (p1 !== 'request_status') {
            throw new Error(`Unexpected first path fragment: ${p1}`);
        }

        const details = messageDetails[message];

        if (!details) {
            console.log(messageDetails);
            throw new Error(
                `Unreachable: could not retrieve canister and method: ${message}`,
            );
        }

        const { canisterId, method } = details;


        const cert = new Certificate(response, new HttpAgent());
        // manipulating the private `verified` property to bypass BLS verification. This is fine for debugging purposes, but it breaks the security model of the IC, so logs in the extension will not be trustable. There's a pure js BLS lib, but it will take 8 seconds to verify each certificate. There's a much faster WASM lib, but chrome extensions make that a pain (could be something worth implementing in the sandbox.)
        (cert as any).verified = true;

        const status = (function () {
            const result = cert.lookup([
                ...paths.flat(),
                new TextEncoder().encode('status'),
            ]);
            if (result instanceof ArrayBuffer) {
                const status = new TextDecoder().decode(result);
                return status as RequestStatusResponseStatus;
            }
            // Missing requestId means we need to wait
            return RequestStatusResponseStatus.Unknown;
        })();

        switch (status) {
            case RequestStatusResponseStatus.Replied: {
                const buffer = cert.lookup([...paths.flat(), 'reply']);
                if (!buffer) {
                    throw new Error(
                        'Unreachable: successful read_state must have reply',
                    );
                }
                const reply = await decodeCandidVals(
                    canisterId,
                    method,
                    buffer,
                    actorHelper
                );
                return { status, reply, size } as RepliedReadStateResponse;
            }

            case RequestStatusResponseStatus.Received:
            case RequestStatusResponseStatus.Unknown:
            case RequestStatusResponseStatus.Processing:
                return { status, size };

            case RequestStatusResponseStatus.Rejected: {
                const code = new Uint8Array(
                    cert.lookup([...paths.flat(), 'reject_code'])!,
                )[0];
                const message = new TextDecoder().decode(
                    cert.lookup([...paths.flat(), 'reject_message'])!,
                );
                return { status: "rejected", message, code, size } as RejectedResponse;
            }

            case RequestStatusResponseStatus.Done:
                throw new Error(
                    `Call was marked as done but we never saw the reply`,
                );
        }
    } else {
        throw 'TODO: Call responses';
    }
}
