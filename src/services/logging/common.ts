import { Principal } from '@dfinity/principal';
import { DecodedRequest, DecodedResponse } from '../capture';
import { getDabCanisterData } from '../dab';
import { ActorHelper } from '../../api/actors';

export let LOG_MAX = 100;
export const increaseLogMax = () => (LOG_MAX += 50);

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
    subnet?: string;
    moduleHash?: string;
    controllers?: string[];
    hasCandid: boolean;
    canisterUIUrl?: string;
}

export interface MethodData {
    name: string;
    query: boolean;
}

export async function getCanisterData(
    canisterId: string,
    actorHelper: ActorHelper
): Promise<CanisterData> {
    const dab = await getDabCanisterData(canisterId, actorHelper.boundryUrl);
    const { subnet, moduleHash, controllers } = await getIcApiCanisterData(
        canisterId,
    );
    const hasCandid = Boolean(await actorHelper.fetchCandidInterface(canisterId));
    return {
        identifier: canisterId,
        subnet,
        moduleHash,
        controllers,
        name: dab?.name,
        // url: dab?.frontend ? mapOptional(dab.frontend) : undefined,
        description: dab?.description,
        logoUrl: dab?.thumbnail,
        hasCandid,
        canisterUIUrl: actorHelper.isLocal
            ? `${actorHelper.boundryUrl}?canisterId=b77ix-eeaaa-aaaaa-qaada-cai&id=${canisterId}`
            : `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=${canisterId}`,
    };
}

export async function getIcApiCanisterData(
    canisterId: string,
): Promise<{ subnet?: string; moduleHash?: string; controllers?: string[] }> {
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
            console.warn(`Expected "${field}" in IC API response.`);
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
