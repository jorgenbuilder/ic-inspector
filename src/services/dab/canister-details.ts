import { sandboxDabLookup } from '../sandbox/dab';

export type DabLookupResponse =
    | {
        name: string;
        description: string;
        thumbnail: string;
    }
    | undefined;

export async function getDabCanisterData(
    canisterId: string,
    boundryUrl: URL,
): Promise<DabLookupResponse> {
    return await sandboxDabLookup(canisterId, boundryUrl);
}
