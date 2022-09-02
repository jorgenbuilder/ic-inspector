import { candidUI, canister } from '../../api/actors';
import { mapOptional } from '../common';
import { sandboxEvalInterface } from '../sandbox';

const interfaces: { [key: string]: 'ok' } = {};

// TODO: Clean up these error classes. We only user the parent, because introspecting error classes between sandbox and origin would require de/serialization that I don't feel like dealing with.
export class CandidInterfaceError extends Error {}

export class CanisterExposesNoInterfaceError extends CandidInterfaceError {}

export class InterfaceMismatchError extends CandidInterfaceError {}

/**
 * Get interface factory from memory, or attempt to import it. Throws an error if an interface factory can't be imported.
 * @deprecated We can't transmit IDLs to and from the sandbox
 */
export async function getCanisterIDL(canisterId: string): Promise<'ok'> {
    if (!(canisterId in interfaces)) {
        const i = await importCandidInterface(canisterId);
        if (!i) {
            throw new CanisterExposesNoInterfaceError(
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
export async function fetchCandidInterface(
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
