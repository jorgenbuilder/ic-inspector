import { IDL } from '@dfinity/candid';
import { CandidInterfaceError, InterfaceMismatchError } from '../candid';
import { sandboxRepository, sandboxRequest } from './handler';

export interface SandboxResponseDecodeCandidArgs {
    type: 'decodeCandidArgs';
    data: any;
}

export interface SandboxResponsedecodeCandidVals {
    type: 'decodeCandidVals';
    data: any;
}

export interface SandboxRequestDecodeCandidArgs {
    type: 'decodeCandidArgs';
    data: {
        canisterId: string;
        method: string;
        data: ArrayBuffer;
    };
}

export interface SandboxRequestDecodeCandidVals {
    type: 'decodeCandidVals';
    data: {
        canisterId: string;
        method: string;
        data: ArrayBuffer;
    };
}

export async function sandboxDecodeCandidArgs(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<any> {
    try {
        const response = await sandboxRequest<SandboxResponseDecodeCandidArgs>({
            type: 'decodeCandidArgs',
            data: { canisterId, method, data },
        });
        return response.data;
    } catch (e) {
        throw new CandidInterfaceError(e.message);
    }
}

export async function sandboxDecodeCandidVals(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<any> {
    try {
        const response = await sandboxRequest<SandboxResponsedecodeCandidVals>({
            type: 'decodeCandidVals',
            data: { canisterId, method, data },
        });
        return response.data;
    } catch (e) {
        throw new CandidInterfaceError(e.message);
    }
}

/**
 * Handle a decode candid request message.
 */
export function sandboxHandleDecodeCandidArgs(
    request: SandboxRequestDecodeCandidArgs,
): SandboxResponseDecodeCandidArgs['data'] {
    const idl = sandboxRepository.interfaces[request.data.canisterId];
    if (!idl) {
        throw new Error(
            'Missing interface definition. Make sure to call sandboxHandleEvalInterface first.',
        );
    }
    console.debug('sandboxHandleDecodeCandidArgs', { idl, request });
    return decodeArgumentValues(idl, request.data.method, request.data.data);
}

/**
 * Handle a decode candid response message. Throws an error if `sandboxHandleEvalInterface` was not called first.
 */
export function sandboxHandleDecodeCandidVals(
    request: SandboxRequestDecodeCandidVals,
): SandboxResponsedecodeCandidVals['data'] {
    const idl = sandboxRepository.interfaces[request.data.canisterId];
    if (!idl) {
        throw new Error(
            'Missing interface definition. Make sure to call sandboxHandleEvalInterface first.',
        );
    }
    console.debug('sandboxHandleDecodeCandidVals', { idl, request });
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
    const types = (function () {
        try {
            return service[method].retTypes;
        } catch {
            throw new InterfaceMismatchError(
                `"${method}" does not exist on interface: ${JSON.stringify(
                    Object.keys(service),
                    null,
                    2,
                )}`,
            );
        }
    })();
    const returnValues = (function () {
        try {
            return IDL.decode(types, msg);
        } catch (e) {
            throw new InterfaceMismatchError(
                `Error decoding "${method}": ${e.message}`,
            );
        }
    })();
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
    const types = (function () {
        try {
            return service[method].argTypes;
        } catch {
            throw new InterfaceMismatchError(
                `"${method}" does not exist on interface: ${JSON.stringify(
                    Object.keys(service),
                    null,
                    2,
                )}`,
            );
        }
    })();
    // Handle optional
    const argValues = (function () {
        try {
            return IDL.decode(types, args);
        } catch (e) {
            throw new InterfaceMismatchError(
                `Error decoding "${method}": ${e.message}`,
            );
        }
    })();
    switch (argValues.length) {
        case 0:
            return null;
        case 1:
            return argValues[0];
        default:
            return argValues;
    }
}
