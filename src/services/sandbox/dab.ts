import { Principal } from '@dfinity/principal';
import { DabLookupResponse } from '../dab/canister-details';
import { sandboxRequest } from './handler';
import { ActorHelper } from '../../api/actors';
import { CanisterMetadata } from '../../api/idl/dab-canisters.did.d';
import { DABCollection } from '../../api/idl/dab-nfts.did.d';

// Copy pasted a bunch of dab-js code because their deps mess with my build
export type DetailType =
    | bigint
    | Array<DetailType>
    | Array<number>
    | string
    | true
    | false
    | number
    | Principal;

export type DetailValue =
    | { I64: bigint }
    | { U64: bigint }
    | { Vec: Array<DetailValue> }
    | { Slice: Array<number> }
    | { Text: string }
    | { True: null }
    | { False: null }
    | { Float: number }
    | { Principal: Principal };

export interface Metadata {
    thumbnail: string;
    name: string;
    frontend: [] | [string];
    description: string;
    principal_id: Principal;
    details: Array<[string, DetailValue]>;
}

const BOOLEAN_DETAIL_TYPE = ['True', 'False'];

export type FormattedMetadata = Omit<Metadata, 'details'> & {
    details: Details;
};

export interface Details {
    [key: string]: DetailType;
}

export const parseDetailValue = (detailValue: DetailValue): DetailType => {
    const key = Object.keys(detailValue)[0];
    const value: DetailType = BOOLEAN_DETAIL_TYPE.includes(key)
        ? Boolean(key)
        : Object.values(detailValue)[0];
    if (Array.isArray(value)) {
        return value.map((v) =>
            typeof value === 'number'
                ? v
                : parseDetailValue(
                    // @ts-ignore: psychedelic code
                    v,
                ),
        );
    }
    return value;
};

export interface SandboxResponseDabLookup {
    type: 'dabLookup';
    data: DabLookupResponse;
}

export interface SandboxRequestDabLookup {
    type: 'dabLookup';
    data: {
        canisterId: string;
        boundryUrl: string;
    };
}

export async function sandboxDabLookup(
    canisterId: string,
    boundryUrl: URL
): Promise<DabLookupResponse> {
    if ((window as any)?.DISABLE_SANDBOX)
        return sandboxHandleDabLookup(
            {
                type: 'dabLookup',
                data: { canisterId, boundryUrl: boundryUrl.toString() },
            }
        );
    return sandboxRequest<SandboxResponseDabLookup>({
        type: 'dabLookup',
        data: { canisterId, boundryUrl: boundryUrl.toString() },
    }).then((r) => r.data);
}

const formatMetadata = (metadata: Metadata): FormattedMetadata => ({
    ...metadata,
    details: formatRegistryDetails(metadata.details),
});

const formatRegistryDetails = (details: Metadata['details']): Details => {
    const formattedDetails: Details = {};
    for (const [key, detailValue] of details) {
        formattedDetails[key] = parseDetailValue(detailValue);
    }
    return formattedDetails;
};

let canisterDirectoryCache: CanisterMetadata[] | undefined;
// DAB token directory isn't working at the moment
// let tokenDirectory = dabTokens.get_all();
let nftDirectoryCache: DABCollection[] | undefined;

/**
 * Handle an evaluate interface message. Stores the generated javascript interface in sandbox memory for future reference.
 */
export async function sandboxHandleDabLookup(
    request: SandboxRequestDabLookup,
): Promise<SandboxResponseDabLookup['data']> {
    const actorHelper = new ActorHelper(new URL(request.data.boundryUrl));
    const {
        data: { canisterId },
    } = request;
    if (canisterDirectoryCache == null) {
        let canisterDirectoryActor = actorHelper.createDABCansitersActor();
        if (canisterDirectoryActor != null) {
            canisterDirectoryCache = await canisterDirectoryActor.get_all();
        }
    }

    if (nftDirectoryCache == null) {
        let nftsActor = actorHelper.createDABNFTsActor();
        if (nftsActor != null) {
            nftDirectoryCache = await nftsActor.get_all();
        }
    }
    const canister = canisterDirectoryCache?.find(
        (canister) => canister.principal_id.toText() === canisterId,
    );
    if (canister) return formatMetadata(canister);
    // const token = (await tokenDirectory).find((token) => token.principal_id.toText() === canisterId);
    // if (token) return formatMetadata(token);
    const nft = nftDirectoryCache?.find(
        (nft) => nft.principal_id.toText() === canisterId,
    );
    if (nft)
        return {
            name: nft.name,
            description: nft.description,
            thumbnail: nft.icon,
        };
    return undefined;
}
