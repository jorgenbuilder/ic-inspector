// NOTE: Comments and code represent my best understanding. They are not authoritative and they are error prone.
import * as Agent from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import CBOR from 'cbor';
import { decode } from './candid';

type CallType = 'query' | 'call' | 'read_state';

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
    certificate: ArrayBuffer;
};

const agent = new Agent.HttpAgent({ host: "https://ic0.app" });

// @ts-ignore
const candidService = ({ IDL }) => IDL.Service({ __get_candid_interface_tmp_hack: IDL.Func([], [IDL.Text], ["query"]), });
const actors: { [key: string]: Agent.Actor } = {};
const candid: { [key: string]: [any, string] } = {};
async function getActor(id: string): Promise<Agent.Actor> {
    if (!actors[id]) {
        actors[id] = Agent.Actor.createActor(candidService, { agent, canisterId: id });
        // @ts-ignore
        const did = (await actors[id].__get_candid_interface_tmp_hack()) as string;
        console.log(candid[id]);
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
        const [, x, y, z] = event.request.url.match(/https?:\/\/(raw\.ic0\.app|localhost:[0-9]+)\/api\/v2\/canister\/(.+)\/(query|call|read_state)/) as [any, string, string, CallType];
        host = x, canister = y, type = z;
    } catch (e) {
        return;
    };

    // Fetch the candid interface for this actor if we don't have it already.
    await getActor(canister);

    // NOTE: We're giving up on read_state for now. I don't see how we'll be able to decode these messages without stealing the agent across global scopes.
    if (type === 'read_state') return;

    // Chrome erroneously parses our cbor into a string, so we need to back that out, then we can properly decode it as CBOR. (String -> B64 -> Bytes -> CBOR = Javascript Object)
    const bytes = _base64ToBytes(btoa(event?.request?.postData?.text as string));
    const { value: { content: data } } = CBOR.decode(bytes) as { value: { content: Agent.QueryRequest | Agent.CallRequest | Agent.ReadStateRequest } };

    // Further decode the request.
    let request: DecodedQueryRequest | DecodedCallRequest | DecodedReadStateRequest;
    switch (type) {
        case 'query':
            const d1 = data as Agent.QueryRequest;
            const r1: DecodedQueryRequest = {
                type, host, canister,
                method: d1.method_name,
                payload: decodeDfinityObject(decode(d1.arg)),
                caller: ((d1.sender as Principal)._isPrincipal ? d1.sender as Principal : Principal.fromUint8Array(d1.sender as Uint8Array)).toString(),
            };
            request = r1;
            break;
        case 'call':
            const d2 = data as Agent.CallRequest;
            const r2: DecodedCallRequest = {
                type, host, canister,
                method: (data as Agent.CallRequest).method_name,
                payload: decodeDfinityObject((decode(d2.arg))),
                caller: ((d2.sender as Principal)._isPrincipal ? d2.sender as Principal : Principal.fromUint8Array(d2.sender as Uint8Array)).toString(),
            };
            request = r2;
            break;
        // case 'read_state':
        //     const d3 = data as Agent.ReadStateRequest;
        //     const r3 : DecodedReadStateRequest = {
        //         type, host, canister,
        //         caller  : (d3.sender as Principal)._isPrincipal ? d3.sender as Principal : Principal.fromUint8Array(d3.sender as Uint8Array),
        //         x : d3.paths.map(([k, v]) => [utfDecoder.decode(k), '*Hashed address to retrieve response from IC output queue.*']),
        //     };
        //     request = r3;
        //     break;
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
                    const d1 = data as Agent.QueryResponse;
                    const r1: DecodedQueryResponse = {
                        status: d1.status,
                        data: d1.status === 'replied' ? decodeDfinityObject(decode(d1?.reply?.arg)) : undefined,
                    };
                    response = r1;
                    break;
                case 'read_state':
                    const d2 = data as Agent.ReadStateResponse;
                    const cert = new Agent.Certificate(d2, agent);
                    // NOTE: cert.verify is the next step, but we can't use wasm in this chrome extension yet. Even after that, it seems probable we would need the signing agent to read the message, and I'm not sure if there's going to be a way to do pull that from the code running on the page outside the scope of this extension. Alternatively, we could give up on read_state messages, and just duplicate calls to create our own.
                    console.log(cert);
                    const r2: DecodedReadStateResponse = {
                        certificate: d2.certificate,
                    };
                    response = r2;
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
        console.log(entry);

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