import { Principal } from "@dfinity/principal";
import { fetchCandidInterface } from "../candid";
import { DecodedRequest, DecodedResponse } from "../capture";
import { mapOptional } from "../common";
import { getDabCanisterData } from "../dab";

export interface CallerData {
    identifier: string;
    isAnonymous: boolean;
}

export interface CanisterData {
    identifier: string;
    // dab-js
    // version?: number;
    name?: string;
    url?: string;
    description?: string;
    logoUrl?: string;
    subnet: string;
    moduleHash: string;
    controllers: string[];
    hasCandid: boolean;
}

export interface MethodData {
    name: string;
    query: boolean;
}

export async function getCanisterData(canisterId: string): Promise<CanisterData> {
    const dab = await getDabCanisterData(canisterId);
    const { subnet, moduleHash, controllers } = await getIcApiCanisterData(
        canisterId,
    );
    const hasCandid = Boolean(await fetchCandidInterface(canisterId));
    return {
        identifier: canisterId,
        subnet,
        moduleHash,
        controllers,
        name: dab?.name,
        url: dab?.frontend ? mapOptional(dab.frontend) : undefined,
        description: dab?.description,
        logoUrl: dab?.thumbnail,
        hasCandid,
    };
}

export async function getIcApiCanisterData(canisterId: string) {
    const response: {
        canister_id: string;
        controllers: string[];
        module_hash: string;
        subnet_id: string;
    } = await fetch(
        `https://ic-api.internetcomputer.org/api/v3/canisters/${canisterId}`,
    ).then((r) => r.json());
    for (const field of ['subnet_id', 'controllers', 'module_hash']) {
        if (!(field in response)) {
            throw new Error(`Expected "${field}" in IC API response.`);
        }
    }
    return {
        subnet: response.subnet_id,
        moduleHash: response.module_hash,
        controllers: response.controllers,
    };
}

export function getCallerData(caller: Principal): CallerData {
    return {
        identifier: caller.toText(),
        isAnonymous: caller.isAnonymous(),
    };
}

export function getMethodData(request: DecodedRequest): MethodData {
    return {
        name: request.method,
        // TODO: I'd like to identify whether a method is _capable_ of a query, not whether a call was made as a query. Can probably get this from idl via sandbox.
        query: request.requestType === 'query',
    };
}

export function isResponseComplete(response: DecodedResponse): boolean {
    return ['replied', 'done', 'rejected'].includes(response.status);
}