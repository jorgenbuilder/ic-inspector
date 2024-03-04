import { IDL } from '@dfinity/candid';
import { v4 as uuid } from 'uuid';
import {
    sandboxHandleDecodeCandidArgs,
    sandboxHandleDecodeCandidVals,
    SandboxRequestDecodeCandidArgs,
    SandboxRequestDecodeCandidVals,
    SandboxResponseDecodeCandidArgs,
    SandboxResponsedecodeCandidVals,
} from './decode';
import {
    SandboxRequestEvalInterface,
    SandboxResponseEvalInterface,
    sandboxHandleEvalInterface,
} from './interfaces';
import {
    SandboxRequestDabLookup,
    SandboxResponseDabLookup,
    sandboxHandleDabLookup,
} from './dab';

const sandbox = document.getElementById('sandbox') as HTMLIFrameElement;

// We cannot transmit complex data to and from the sandbox, so we store it there locally.
// Each execution environment will have it's own version of this object in memory.
export const sandboxRepository = {
    interfaces: {} as { [key: string]: IDL.InterfaceFactory },
};

interface SandboxRequest {
    request:
    | SandboxRequestEvalInterface
    | SandboxRequestDecodeCandidArgs
    | SandboxRequestDecodeCandidVals
    | SandboxRequestDabLookup;
    requestId: string;
}

/**
 * Send a request to the sandbox and receive the response.
 * CAUTION: Data is serialized when sent to and from the sandbox, and only simple data can be trasmitted correctly. Classes, functions, and some other data types will not survive.
 */
export async function sandboxRequest<T>(request: SandboxRequest['request']) {
    const requestId = uuid();
    if (!sandbox.contentWindow) {
        throw new Error('Missing sandbox window.');
    }
    const response = sandboxRecieveResponse<T>(requestId);
    sandbox.contentWindow.postMessage({ requestId, request }, '*');
    return response;
}

interface SandboxResponse {
    response:
    | SandboxResponseEvalInterface
    | SandboxResponseDecodeCandidArgs
    | SandboxResponsedecodeCandidVals
    | SandboxResponseDabLookup;
    requestId: string;
}

interface SandboxError {
    requestId: string;
    error: Error;
}

type SandboxResult = SandboxResponse | SandboxError;

/**
 * Bind a handler to receive a response from the sandbox.
 */
async function sandboxRecieveResponse<T>(requestId: string) {
    return new Promise<T>((res, rej) => {
        const receiveResponse = (event: MessageEvent<SandboxResult>) => {
            if (event.data.requestId === requestId) {
                if ('response' in event.data) {
                    res(event.data.response as unknown as T);
                } else {
                    rej(event.data.error);
                }
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
    (source as Window).postMessage(
        { requestId, response } as SandboxResponse,
        '*',
    );
    if (!(source instanceof Window)) {
        console.warn('Non window source', typeof source, source);
    }
}

/**
 * Post an error from the sandbox to the request origin.
 */
function sandboxPostError(
    source: MessageEventSource,
    requestId: string,
    error: Error,
) {
    console.debug(sandboxPostError.name, {
        source,
        requestId,
        error,
    });
    (source as Window).postMessage({ requestId, error } as SandboxError, '*');
    if (!(source instanceof Window)) {
        console.warn('Non window source', typeof source, source);
    }
}

/**
 * Route sandbox messages to handlers.
 */
export async function sandboxHandleMessage(
    message: MessageEvent<SandboxRequest>,
): Promise<void> {
    if (!message.source) {
        throw new Error('Unreachable: could not determine request source');
    }
    try {
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
                    data: sandboxHandleDecodeCandidArgs(message.data.request),
                });
                break;
            case 'decodeCandidVals':
                sandboxPostResponse(message.source, message.data.requestId, {
                    type: message.data.request.type,
                    data: sandboxHandleDecodeCandidVals(message.data.request),
                });
                break;
            case 'dabLookup':
                sandboxPostResponse(message.source, message.data.requestId, {
                    type: message.data.request.type,
                    data: await sandboxHandleDabLookup(message.data.request),
                });
        }
    } catch (e) {
        if (e instanceof Error) {
            // Catch, serialize, and post errors to the origin, because we can't catch errors across execution environments.
            sandboxPostError(message.source, message.data.requestId, e);
        } else {
            throw new Error('Unreachable.');
        }
    }
}
