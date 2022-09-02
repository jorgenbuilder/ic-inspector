import { IDL } from '@dfinity/candid';
import { sandboxRepository, sandboxRequest } from './handler';

export interface SandboxResponseEvalInterface {
    type: 'evalInterface';
    data: 'ok';
}

export interface SandboxRequestEvalInterface {
    type: 'evalInterface';
    data: {
        canisterId: string;
        javascriptAsString: string;
    };
}

export async function sandboxEvalInterface(
    canisterId: string,
    javascriptAsString: string,
): Promise<'ok'> {
    return sandboxRequest<SandboxResponseEvalInterface>({
        type: 'evalInterface',
        data: { canisterId, javascriptAsString },
    }).then((r) => r.data);
}

/**
 * Handle an evaluate interface message. Stores the generated javascript interface in sandbox memory for future reference.
 */
export function sandboxHandleEvalInterface(
    request: SandboxRequestEvalInterface,
): SandboxResponseEvalInterface['data'] {
    const { data } = request;
    const idl = Function(stripIdl(data.javascriptAsString))()(
        IDL,
    ) as IDL.InterfaceFactory;
    sandboxRepository.interfaces[request.data.canisterId] = idl;
    return 'ok';
}

export function stripIdl(idl: string) {
    return (
        idl
            // Remove extraneous export from interface file
            .replace(/export const init = \(\{ IDL \}\) => \{.+\}/, '')
            // Coerce export into a simple return statement for us to eval
            .replace(
                'export const idlFactory = ({ IDL }) =>',
                'return (IDL) =>',
            )
    );
}
