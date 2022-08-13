import { Principal } from '@dfinity/principal';
import { dab } from '../api/actors';
import { mapOptional } from './common';

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
            typeof value === 'number' ? v : parseDetailValue(
                // @ts-ignore: psychedelic code
                v
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

export async function getDabCanisterData(canisterId: string) {
    return dab
        .get(Principal.fromText(canisterId))
        .then(mapOptional)
        .then((r) => (r ? formatMetadata(r) : r));
}
