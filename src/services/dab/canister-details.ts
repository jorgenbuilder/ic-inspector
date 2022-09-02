import { Principal } from '@dfinity/principal';
import { dabCanisters, dabNFTs } from '../../api/actors';

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

const formatRegistryDetails = (details: Metadata['details']): Details => {
    const formattedDetails: Details = {};
    for (const [key, detailValue] of details) {
        formattedDetails[key] = parseDetailValue(detailValue);
    }
    return formattedDetails;
};

const formatMetadata = (metadata: Metadata): FormattedMetadata => ({
    ...metadata,
    details: formatRegistryDetails(metadata.details),
});

let canisterDirectory = dabCanisters.get_all();
// DAB token directory isn't working at the moment
// let tokenDirectory = dabTokens.get_all();
let nftDirectory = dabNFTs.get_all();

export async function getDabCanisterData(canisterId: string): Promise<
    | {
          name: string;
          description: string;
          thumbnail: string;
      }
    | undefined
> {
    const canister = (await canisterDirectory).find(
        (canister) => canister.principal_id.toText() === canisterId,
    );
    if (canister) return formatMetadata(canister);
    // const token = (await tokenDirectory).find((token) => token.principal_id.toText() === canisterId);
    // if (token) return formatMetadata(token);
    const nft = (await nftDirectory).find(
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
