import { IDL } from '@dfinity/candid';
import { v4 as uuid } from 'uuid';

const sandbox = document.getElementById('sandbox') as HTMLIFrameElement;

// We cannot transmit complex data to and from the sandbox, so we store it there locally.
// Each execution environment will have it's own version of this object in memory.
const sandboxRepository = {
    interfaces: {} as { [key: string]: IDL.InterfaceFactory },
};

///////////////
// Requests //
/////////////

interface SandboxRequestEvalInterface {
    type: 'evalInterface';
    data: {
        canisterId: string;
        javascriptAsString: string;
    };
}

interface SandboxRequestdecodeCandidArgs {
    type: 'decodeCandidArgs';
    data: {
        canisterId: string;
        method: string;
        data: ArrayBuffer;
    };
}

interface SandboxRequestdecodeCandidVals {
    type: 'decodeCandidVals';
    data: {
        canisterId: string;
        method: string;
        data: ArrayBuffer;
    };
}

interface SandboxRequest {
    request:
        | SandboxRequestEvalInterface
        | SandboxRequestdecodeCandidArgs
        | SandboxRequestdecodeCandidVals;
    requestId: string;
}

/**
 * Send a request to the sandbox and receive the response.
 * CAUTION: Data is serialized when sent to and from the sandbox, and only simple data can be trasmitted correctly. Classes, functions, and some other data types will not survive.
 */
async function sandboxRequest<T>(request: SandboxRequest['request']) {
    const requestId = uuid();
    if (!sandbox.contentWindow) {
        throw new Error('Missing sandbox window.');
    }
    console.debug(sandboxRequest.name, { requestId, request });
    const response = sandboxRecieveResponse<T>(requestId);
    sandbox.contentWindow.postMessage({ requestId, request }, '*');
    return response;
}

////////////////
// Responses //
//////////////

interface SandboxResponseEvalInterface {
    type: 'evalInterface';
    data: 'ok';
}

interface SandboxResponsedecodeCandidArgs {
    type: 'decodeCandidArgs';
    data: any;
}

interface SandboxResponsedecodeCandidVals {
    type: 'decodeCandidVals';
    data: any;
}

interface SandboxResponse {
    response:
        | SandboxResponseEvalInterface
        | SandboxResponsedecodeCandidArgs
        | SandboxResponsedecodeCandidVals;
    requestId: string;
}

/**
 * Bind a handler to receive a response from the sandbox.
 */
async function sandboxRecieveResponse<T>(requestId: string) {
    return new Promise<T>((res) => {
        const receiveResponse = (event: MessageEvent<SandboxResponse>) => {
            if (event.data.requestId === requestId) {
                res(event.data.response as unknown as T);
                console.debug(sandboxRecieveResponse.name, {
                    response: event.data.response,
                });
                window.removeEventListener('message', receiveResponse);
            }
        };
        window.addEventListener('message', receiveResponse);
    });
}

////////////////////////////////
// Internal Sandbox Handlers //
//////////////////////////////

/**
 * Post a response from the sandbox to the request origin.
 * CAUTION: Data is serialized when sent to and from the sandbox, and only simple data can be trasmitted correctly. Classes, functions, and some other data types will not survive.
 */
function sandboxPostResponse(
    source: MessageEventSource,
    requestId: string,
    response: SandboxResponse['response'],
) {
    console.debug(sandboxPostResponse.name, {
        source,
        requestId,
        response,
        sandboxRepository,
    });
    source.postMessage({ requestId, response } as SandboxResponse, {
        targetOrigin: '*',
    });
}

/**
 * Route sandbox messages to handlers.
 */
export function sandboxHandleMessage(
    message: MessageEvent<SandboxRequest>,
): void {
    if (!message.source) {
        throw new Error('Unreachable: could not determine request source');
    }
    switch (message.data.request.type) {
        case 'evalInterface':
            sandboxPostResponse(message.source, message.data.requestId, {
                type: message.data.request.type,
                data: sandboxHandleEvalInterface(message.data.request),
            });
            break;
        case 'decodeCandidArgs':
            sandboxPostResponse(message.source, message.data.requestId, {
                type: message.data.request.type,
                data: sandboxHandledecodeCandidArgs(message.data.request),
            });
            break;
        case 'decodeCandidVals':
            sandboxPostResponse(message.source, message.data.requestId, {
                type: message.data.request.type,
                data: sandboxHandledecodeCandidVals(message.data.request),
            });
            break;
    }
}

/**
 * Handle an evaluate interface message. Stores the generated javascript interface in sandbox memory for future reference.
 */
function sandboxHandleEvalInterface(
    request: SandboxRequestEvalInterface,
): SandboxResponseEvalInterface['data'] {
    const { data } = request;
    const js = data.javascriptAsString // Beat the interface into submission
        .replace('export const init = ({ IDL }) => { return []; };', '')
        .replace('export const idlFactory = ({ IDL }) =>', 'return (IDL) =>');
    const idl = Function(js)()(IDL) as IDL.InterfaceFactory;
    sandboxRepository.interfaces[request.data.canisterId] = idl;
    return 'ok';
}

/**
 * Handle a decode candid request message.
 */
function sandboxHandledecodeCandidArgs(
    request: SandboxRequestdecodeCandidArgs,
): SandboxResponsedecodeCandidArgs['data'] {
    const idl = sandboxRepository.interfaces[request.data.canisterId];
    if (!idl) {
        throw new Error(
            'Missing interface definition. Make sure to call sandboxHandleEvalInterface first.',
        );
    }
    console.debug('sandboxHandledecodeCandidArgs', request);
    return decodeArgumentValues(idl, request.data.method, request.data.data);
}

/**
 * Handle a decode candid response message. Throws an error if `sandboxHandleEvalInterface` was not called first.
 */
function sandboxHandledecodeCandidVals(
    request: SandboxRequestdecodeCandidVals,
): SandboxResponsedecodeCandidVals['data'] {
    const idl = sandboxRepository.interfaces[request.data.canisterId];
    if (!idl) {
        throw new Error(
            'Missing interface definition. Make sure to call sandboxHandleEvalInterface first.',
        );
    }
    console.debug('sandboxHandledecodeCandidVals', request);
    return decodeReturnValue(idl, request.data.method, request.data.data);
}

/**
 * Determines return types and decodes message value.
 */
function decodeReturnValue(
    idl: IDL.InterfaceFactory,
    method: string,
    msg: ArrayBuffer,
) {
    const service = Object.fromEntries(
        (idl as any)._fields, // Accessing a private field in this class 😬
    );
    const types = service[method].retTypes;
    const returnValues = IDL.decode(types, msg);
    // Handle optional
    switch (returnValues.length) {
        case 0:
            return null;
        case 1:
            return returnValues[0];
        default:
            return returnValues;
    }
}

/**
 * Determines argument types and decodes argument values.
 */
function decodeArgumentValues(
    idl: IDL.InterfaceFactory,
    method: string,
    args: ArrayBuffer,
) {
    const service = Object.fromEntries(
        (idl as any)._fields, // Accessing a private field in this class 😬
    );
    const types = service[method].argTypes;
    // Handle optional
    const argValues = IDL.decode(types, args);
    switch (argValues.length) {
        case 0:
            return null;
        case 1:
            return argValues[0];
        default:
            return argValues;
    }
}

///////////////////////////
// External Sandbox API //
/////////////////////////

export function sandboxEvalInterface(
    canisterId: string,
    javascriptAsString: string,
): Promise<'ok'> {
    return sandboxRequest<SandboxResponseEvalInterface>({
        type: 'evalInterface',
        data: { canisterId, javascriptAsString },
    }).then((r) => r.data);
}

export function sandboxDecodeCandidArgs(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<any> {
    return sandboxRequest<SandboxResponsedecodeCandidArgs>({
        type: 'decodeCandidArgs',
        data: { canisterId, method, data },
    }).then((r) => r.data);
}

export function sandboxDecodeCandidVals(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<any> {
    return sandboxRequest<SandboxResponsedecodeCandidVals>({
        type: 'decodeCandidVals',
        data: { canisterId, method, data },
    }).then((r) => r.data);
}
