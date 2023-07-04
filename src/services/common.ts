import { Principal } from '@dfinity/principal';

export function mapOptional<T>(value: [T] | []): T | undefined {
    if (value.length) {
        return value[0];
    }
    return undefined;
}

export function base64ToBytes(base64: string): Uint8Array {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

export function asPrincipal(
    principal: Principal | Uint8Array | unknown,
): Principal {
    if (principal instanceof Principal) return principal;
    if (principal instanceof Uint8Array)
        return Principal.fromUint8Array(principal);
    return Principal.from(principal);
}

/**
 * Replace big int and principal types with string values, use before JSON.stringify.
 * @param obj any javascript object
 * @returns the same object with bigint and principals cast to strings
 */
export function serialize(obj: { [key: string]: any }): any {
    return JSON.parse(
        JSON.stringify(obj, (key, value) => {
            if (typeof value === 'bigint') {
                return `${value.toString()}n`;
            } else if (value?._isPrincipal) {
                return Principal.fromUint8Array(value._arr).toString();
            }
            return value;
        }),
    );
}

/**
 * Prepares an object to be displayed in our Json viewer. Makes principals and Uint8Arrays look better.
 */
export function pretty(data: any): any {
    if (data?._isPrincipal) {
        return Principal.fromUint8Array(data._arr).toString();
    } else if (data instanceof Uint8Array) {
        return Array.from(data);
    } else {
        return data;
    }
}

/** Recursively transform all values in an object. */
export function transform(obj: any, transformer: (value: any) => any): any {
    let result = transformer(obj);

    if (typeof result === 'object' && result !== null) {
        const keys = Object.keys(result);
        if (keys.length > 0 && keys.every((key, i) => Number(key) === i)) {
            // This is a pseudo-array. Convert it to an actual array.
            result = keys.map((key) => result[key]);
        }
    }

    if (Array.isArray(result)) {
        return result.map((value) => transform(value, transformer));
    } else if (typeof result === 'object' && result !== null) {
        return Object.keys(result).reduce((acc, key) => {
            acc[key] = transform(result[key], transformer);
            return acc;
        }, {} as any);
    } else {
        return result;
    }
}
