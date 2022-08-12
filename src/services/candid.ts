import { candidUI, canister } from '../api/actors';
import { decodeDfinityObject, mapOptional } from './common';
import {
    sandboxDecodeCandidArgs,
    sandboxDecodeCandidVals,
    sandboxEvalInterface,
} from './sandbox';
import { IDL } from '@dfinity/candid';

const interfaces: { [key: string]: 'ok' } = {};

class InterfaceDoesntExistError extends Error {}

export interface CandidDecodeResult {
    result: any;
    withInterface: boolean;
}

/**
 * Get interface factory from memory, or attempt to import it. Throws an error if an interface factory can't be imported.
 * @deprecated We can't transmit IDLs to and from the sandbox
 */
async function getCanisterIDL(canisterId: string): Promise<'ok'> {
    if (!(canisterId in interfaces)) {
        const i = await importCandidInterface(canisterId);
        if (!i) {
            throw new InterfaceDoesntExistError(
                `Could not retrieve IDL for canister ${canisterId}`,
            );
        }
        interfaces[canisterId] = i;
    }
    return interfaces[canisterId];
}

/**
 * Attempts to import the interface bindings for a given canister, which can be used for effective candid decoding. Currently will not work for Rust canisters (will return undefined).
 */
async function importCandidInterface(
    canisterId: string,
): Promise<'ok' | undefined> {
    const candid = await fetchCandidInterface(canisterId);
    if (!candid) return undefined;
    const js = await convertCandidToJavascript(candid);
    if (!js) return undefined;
    return sandboxEvalInterface(canisterId, js);
}

/**
 * Attempts to retrieve the candid interface for a given canister. Relies on `canister.__get_candid_interface_tmp_hack`, which works for Motoko canisters, but not Rust canisters.
 * @returns Candid interface in text format
 */
async function fetchCandidInterface(
    canisterId: string,
): Promise<string | undefined> {
    try {
        return await canister(canisterId).__get_candid_interface_tmp_hack();
    } catch (e) {
        return undefined;
    }
}

/**
 * Attempts to convert a candid interface definition into a javascript interface definition, using the dfinity Candid UI canister.
 * @param candid Candid interface in text format
 * @returns Javascript interface in text format
 */
async function convertCandidToJavascript(
    candid: string,
): Promise<string | undefined> {
    return mapOptional(await candidUI.did_to_js(candid));
}

/**
 * If an interface cannot be retrieved for a canister, we can do a partial decode without one.
 */
function decodeCandidWithoutInterface(data: ArrayBuffer): any {
    const response = IDL.decode([IDL.Unknown], data);
    console.debug(decodeCandidWithoutInterface.name, { data, response });
    return response;
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
            result: decodeDfinityObject(
                await sandboxDecodeCandidArgs(canisterId, method, data),
            ),
            withInterface: true,
        };
    } catch (e) {
        if (e instanceof InterfaceDoesntExistError) {
            return {
                result: decodeDfinityObject(
                    await decodeCandidWithoutInterface(data),
                ),
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
            result: decodeDfinityObject(
                await sandboxDecodeCandidVals(canisterId, method, data),
            ),
            withInterface: true,
        };
    } catch (e) {
        if (e instanceof InterfaceDoesntExistError) {
            return {
                result: decodeDfinityObject(
                    await decodeCandidWithoutInterface(data),
                ),
                withInterface: false,
            };
        }
        throw e;
    }
}
