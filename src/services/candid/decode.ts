import { sandboxDecodeCandidArgs, sandboxDecodeCandidVals } from "../sandbox";
import { decodeNoInterface } from "./decode-no-interface";
import { CandidInterfaceError, getCanisterIDL } from "./interfaces";

export interface CandidDecodeResult {
    result: any;
    withInterface: boolean;
}

/**
 * Decode candid ArrayBuffer for an internet computer request.
 */
 export async function decodeCandidArgs(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<CandidDecodeResult> {
    try {
        await getCanisterIDL(canisterId);
        return {
            result: await sandboxDecodeCandidArgs(canisterId, method, data),
            withInterface: true,
        };
    } catch (e) {
        if (e instanceof CandidInterfaceError) {
            return {
                result: await decodeCandidWithoutInterface(data),
                withInterface: false,
            };
        }
        throw e;
    }
}

/**
 * Decode candid ArrayBuffer for an internet computer response.
 */
export async function decodeCandidVals(
    canisterId: string,
    method: string,
    data: ArrayBuffer,
): Promise<CandidDecodeResult> {
    try {
        await getCanisterIDL(canisterId);
        return {
            result: await sandboxDecodeCandidVals(canisterId, method, data),
            withInterface: true,
        };
    } catch (e) {
        if (e instanceof CandidInterfaceError) {
            return {
                result: await decodeCandidWithoutInterface(data),
                withInterface: false,
            };
        }
        throw e;
    }
}


/**
 * If an interface cannot be retrieved for a canister, we can do a partial decode without one.
 */
 function decodeCandidWithoutInterface(data: ArrayBuffer): any {
    return decodeNoInterface(data);
}