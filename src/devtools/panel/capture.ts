// NOTE: Comments and code represent my best understanding. They are not authoritative and they are error prone.
import * as Agent from '@dfinity/agent';
import { RequestId, requestIdOf } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import CBOR from 'cbor';
import { decode } from './candid';

type CallType = 'query' | 'call' | 'read_state';

let requestId : RequestId;

export interface LogEvent {
    time: Date;
    decoded: {
        request: DecodedQueryRequest | DecodedCallRequest | DecodedReadStateRequest;
        response: DecodedQueryResponse | DecodedCallResponse | DecodedReadStateResponse;
    };
    raw: {
        url: string;
        request: unknown;
        response: unknown;
    };
};

// Abstract decoded request.
interface DecodedICRequest {
    host: string;
    canister: string;
    type: CallType;
    caller: string;
};

// A decoded query request.
interface DecodedQueryRequest extends DecodedICRequest {
    type: 'query';
    method: string;
    payload: {};
}

// A decoded call request.
interface DecodedCallRequest extends DecodedICRequest {
    type: 'call';
    method: string;
    payload: {};
}

// A decoded read_state request.
interface DecodedReadStateRequest extends DecodedICRequest {
    type: 'read_state';
    x: any;
};

// A decoded query response.
interface DecodedQueryResponse {
    status: 'replied' | 'rejected';
    data?: { [key: string]: any };
};

// A decoded call response.
type DecodedCallResponse = null;

// A decoded read_state response.
interface DecodedReadStateResponse {
    response: any;
};

const agent = new Agent.HttpAgent({ host: "https://ic0.app" });
const localAgent = new Agent.HttpAgent({ host: "htt://localhost:8000" });

// @ts-ignore
const candidService = ({ IDL }) => IDL.Service({ __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ["query"]), });
const actors: { [key: string]: Agent.Actor } = {};
const candid: { [key: string]: [any, string | false] } = {};
async function getActor(id: string, isLocal: boolean = false): Promise<Agent.Actor> {
    if (actors[id] === undefined) {
        actors[id] = Agent.Actor.createActor(candidService, { agent: isLocal ? localAgent : agent, canisterId: id });
        try {
            // @ts-ignore
            candid[id] = (await actors[id].__get_candid_interface_tmp_hack()) as string;
        } catch (e) {
            console.error('Error fetching canister candid', e);
            candid[id] = [undefined, false];
        };
    }
    return actors[id];
};

// Capture, decode and log a Dfinity CBOR/Candid network event from a chrome network event.
export default async function capture(
    event: chrome.devtools.network.Request,
    log: LogEvent[],
    callback?: (event: LogEvent) => void,
): Promise<void> {

    const time = new Date();

    // Not interested in pre flight requests for the moment.
    if (event.request.method === 'OPTIONS') return;

    // For now we focus on ingress messages bound for the IC and their responses. It might be interesting to look at HTTP requests more broadly in the future, to examine assets canisters and so on.
    let host: string, canister: string, type: CallType;
    try {
        const [, x, y, z] = event.request.url.match(/https?:\/\/(?:.+)?((?:ic0\.app|dfinity.network)|localhost:[0-9]+)\/api\/v2\/canister\/(.+)\/(query|call|read_state)/) as [any, string, string, CallType];
        host = x, canister = y, type = z;
    } catch (e) {
        return;
    };

    const isLocal = event.request.url.includes('localhost');

    // Fetch the candid interface for this actor if we don't have it already.
    // await getActor(canister, isLocal);

    // NOTE: We're giving up on read_state for now. I don't see how we'll be able to decode these messages without stealing the agent across global scopes.
    // if (type === 'read_state') return;
    const utfDecoder = new TextDecoder('utf-8');

    // Chrome erroneously parses our cbor into a string, so we need to back that out, then we can properly decode it as CBOR. (String -> B64 -> Bytes -> CBOR = Javascript Object)
    const bytes = _base64ToBytes(btoa(event?.request?.postData?.text as string));
    const { value: { content: data } } = CBOR.decode(bytes) as { value: { content: Agent.QueryRequest | Agent.CallRequest | Agent.ReadStateRequest } };

    // Further decode the request.
    let request: DecodedQueryRequest | DecodedCallRequest | DecodedReadStateRequest;
    switch (type) {
        case 'query':
            const queryData = data as Agent.QueryRequest;
            const queryRequest: DecodedQueryRequest = {
                type, host, canister,
                method: queryData.method_name,
                payload: decodeDfinityObject(decode(queryData.arg)),
                caller: ((queryData.sender as Principal)._isPrincipal ? queryData.sender as Principal : Principal.fromUint8Array(queryData.sender as Uint8Array)).toString(),
            };
            request = queryRequest;
            break;
        case 'call':
            const callData = data as Agent.CallRequest;
            const callRequest: DecodedCallRequest = {
                type, host, canister,
                method: (data as Agent.CallRequest).method_name,
                payload: decodeDfinityObject((decode(callData.arg))),
                caller: ((callData.sender as Principal)._isPrincipal ? callData.sender as Principal : Principal.fromUint8Array(callData.sender as Uint8Array)).toString(),
            };
            requestId = requestIdOf(callData);
            request = callRequest;
            break;
        case 'read_state':
            const readStateData = data as Agent.ReadStateRequest;
            const readStateRequest: DecodedReadStateRequest = {
                type, host, canister,
                caller: ((readStateData.sender as Principal)._isPrincipal ? readStateData.sender as Principal : Principal.fromUint8Array(readStateData.sender as Uint8Array)).toString(),
                x: readStateData.paths.map(([k, v]) => [utfDecoder.decode(k), '*Hashed address to retrieve response from IC output queue.*']),
            };
            request = readStateRequest;
            break;
    };


    // Capture / decode the response
    // NOTE: Apparently manifest v3 allows a promise based architecture for everything, but I can't find any docs on it for this method.
    event.getContent(async (content, encoding) => {

        // @ts-ignore
        let response: DecodedQueryResponse | DecodedCallResponse | DecodedReadStateResponse = null;
        if (content) {
            const bytes = _base64ToBytes(content);
            const { value: data } = CBOR.decode(bytes) as { value: Agent.QueryResponse | Agent.ReadStateResponse };
            // const responseByteFields = findByteFields(responseCBOR);
            // const responseCandid = findCandid(responseByteFields);
            // Further decode response.
            switch (type) {
                case 'query':
                    const queryData = data as Agent.QueryResponse;
                    const queryResponse: DecodedQueryResponse = {
                        status: queryData.status,
                        data: queryData.status === 'replied' ? decodeDfinityObject(decode(queryData?.reply?.arg)) : undefined,
                    };
                    response = queryResponse;
                    break;
                case 'call':
                    const callData = data as Agent.QueryResponse;
                    const callResponse: DecodedQueryResponse = {
                        status: callData.status,
                        data: callData.status === 'replied' ? decodeDfinityObject(decode(callData?.reply?.arg)) : undefined,
                    };
                    response = callResponse;
                    break;
                case 'read_state':
                    const readStateData = data as Agent.ReadStateResponse;
                    const cert = new Agent.Certificate(readStateData, agent);
                    const path = [new TextEncoder().encode('request_status'), requestId, 'reply'];
                    
                    const readStateResponse: DecodedReadStateResponse = {
                        response: decode(cert.lookup(path) as ArrayBuffer)
                    };
                    response = readStateResponse;
                    break;
            };
        };

        const entry: LogEvent = {
            time,
            decoded: { request, response },
            raw: {
                url: event.request.url,
                request: event.request,
                response: event.response,
            }
        };

        log.push(entry);

        if (callback) {
            callback(entry);
        }

    });
}

function decodeDfinityObject(
    obj: { [key: string]: any }
) {
    const response: { [key: string]: unknown } = {};
    for (const [key, value] of Object.entries<unknown>(obj)) {
        if ((value as Principal)?._isPrincipal) {
            response[key] = (value as Principal)?.toText();
        } else if (typeof value === 'bigint') {
            response[key] = Number(value);
        } else if ((value as any)?._isBuffer) {
            response[key] = value;
        }
        else if (typeof value === 'object') {
            response[key] = decodeDfinityObject(value as object);
        } else {
            response[key] = value;
        }
    }
    return response;
}

// Converting things...
function _base64ToBytes(base64: string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}
