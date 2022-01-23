// NOTE: Comments and code represent my best understanding. They are not authoritative and will be wrong in some places. I don't understand everthing about the Internet Computer.

import { JsonValue } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import CBOR from 'cbor';
import { decode } from './candid';

type CallType = 'query' | 'call' | 'read_state';

export interface LogEvent {
    time        : Date;
    decoded: {
        request : DecodedQueryRequest | DecodedCallRequest | DecodedReadStateRequest;
        response: DecodedQueryResponse | DecodedCallResponse | DecodedReadStateResponse;
    };
    raw: {
        url     : string;
        request : unknown;
        response: unknown;
    };
};

// Abstract raw request.
interface RawICRequest {
    sender          : Uint8Array;
    ingress_expiry  : BigInt;
};

// A query call to the IC.
interface RawQueryRequest extends RawICRequest {
    arg         : Uint8Array;
    canister_id : Uint8Array;
    method_name : string;
    request_type: 'query'
};

// The initial ingress message of an update call to the IC.
interface RawCallRequest extends RawICRequest {
    arg         : Uint8Array;
    canister_id : Uint8Array;
    method_name : string;
    request_type: 'call';
};

// Reading the result of an update call from the output queue of the IC.
interface RawReadStateRequest extends RawICRequest {
    paths       : Uint8Array[][];
    request_type: 'read_state';
};

// Abstract decoded request.
interface DecodedICRequest {
    host    : string;
    canister: string;
    type    : CallType;
};

// A decoded query request.
interface DecodedQueryRequest extends DecodedICRequest {
    type    : 'query';
    method  : string;
    // TODO: These come from the response
    // subnet  : string;
    // node    : string;
    payload : {};
}

// A decoded call request.
interface DecodedCallRequest extends DecodedICRequest {
    type    : 'call';
    method  : string;
    // TODO: These come from the response
    // subnet  : string;
    // node    : string;
    payload : {};
}

// A decoded read_state request.
interface DecodedReadStateRequest extends DecodedICRequest {
    type    : 'read_state';
    x       : any;
};

// Raw query response.
interface RawQueryResponse {
    status  : 'replied';
    reply: {
        arg : Uint8Array;
    };
};

// Raw read_state response.
interface RawReadStateResponse {
    certificate : Uint8Array;
};

// A decoded query response.
interface DecodedQueryResponse {
    data: { [key : string] : any };
};

// A decoded call response.
type DecodedCallResponse = null;

// A decoded read_state response.
interface DecodedReadStateResponse {
    certificate : Uint8Array;
};

const utfDecoder = new TextDecoder();

// Capture, decode and log a Dfinity CBOR/Candid network event from a chrome network event.
export default function capture(
    event: chrome.devtools.network.Request,
    log: LogEvent[],
    callback?: (event: LogEvent) => void,
): void {

    const time = new Date();

    // Not interested in pre flight requests for the moment.
    if (event.request.method === 'OPTIONS') return;

    // For now we focus on ingress messages bound for the IC and their responses. It might be interesting to look at HTTP requests more broadly in the future, to examine assets canisters and so on.
    let host: string, canister: string, type: CallType;
    try {
        const [, x, y, z] = event.request.url.match(/https?:\/\/(raw\.ic0\.app|localhost:[0-9]+)\/api\/v2\/canister\/(.+)\/(query|call|read_state)/) as [any, string, string, CallType];
        host = x, canister = y, type = z;
    } catch (e) {
        return;
    };

    const mime = event.response.content.mimeType;

    // Chrome treats erroneously parses our cbor into a string, so we need to back that out, then we can properly decode it as CBOR. (String -> B64 -> Bytes -> CBOR = Javascript Object)
    const bytes = _base64ToBytes(btoa(event?.request?.postData?.text as string));
    const { value : { content : data } } = CBOR.decode(bytes) as { value : { content : RawQueryRequest | RawCallRequest | RawReadStateRequest }};

    // Further decode the request.
    let request : DecodedQueryRequest | DecodedCallRequest | DecodedReadStateRequest;
    switch (type) {
        case 'query':
            const d1 = data as RawQueryRequest;
            const r1 : DecodedQueryRequest = {
                type, host, canister,
                method  : d1.method_name,
                payload : decodeDfinityObject(decode(d1.arg)),
            };
            request = r1;
            break;
        case 'call':
            const d2 = data as RawCallRequest;
            const r2 : DecodedCallRequest = {
                type, host, canister,
                method  : (data as RawCallRequest).method_name,
                payload : decodeDfinityObject((decode(d2.arg))),
            };
            request = r2;
            break;
        case 'read_state':
            // TODO: Decoding path values is a total mystery...
            // Perhaps I need access to the signing agent.
            const d3 = data as RawReadStateRequest;
            const r3 : DecodedReadStateRequest = {
                type, host, canister,
                x : d3.paths.map(([k, v]) => [utfDecoder.decode(k), v])
            };
            request = r3;
            break;
    };

    // @ts-ignore
    console.info(host, canister, type, request?.method);


    // Capture / decode the response
    // NOTE: Apparently manifest v3 allows a promise based architecture for everything, but I can't find any docs on it for this method.
    event.getContent((content, encoding) => {

        let response : DecodedQueryResponse | DecodedCallResponse | DecodedReadStateResponse = null;
        if (content) {
            const bytes = _base64ToBytes(content);
            const { value : data } = CBOR.decode(bytes) as { value : RawQueryResponse | RawReadStateResponse };
            // const responseByteFields = findByteFields(responseCBOR);
            // const responseCandid = findCandid(responseByteFields);
            // Further decode response.
            switch (type) {
                case 'query':
                    const d1 = data as RawQueryResponse;
                    const r1 : DecodedQueryResponse = {
                        data : decodeDfinityObject(decode(d1.reply.arg)),
                    };
                    response = r1;
                    break;
                case 'read_state':
                    // TODO: Not sure how to decode this certificate yet. Perhaps I need access to the signing agent.
                    const d2 = data as RawReadStateResponse;
                    const r2 : DecodedReadStateResponse = {
                        certificate : d2.certificate,
                    };
                    response = r2;
                    break;
            };
        };

        const entry : LogEvent = {
            time,
            decoded: { request, response },
            raw: {
                url     : event.request.url,
                request : event.request,
                response: event.response,
            }
        };
        console.log(entry);

        log.push(entry);

        if (callback) {
            callback(entry);
        }

    });
}

function decodeDfinityObject (
    obj : {[key : string]: any}
) {
    const response : { [key : string] : unknown} = {};
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

// function toHexString(byteArray: Uint8Array) {
//     return Array.from(byteArray).map(x => {
//         return byteToHex(x);
//     }).join(' ');
// }

// const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

// function byteToHex(b: number) {
//     return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
// }