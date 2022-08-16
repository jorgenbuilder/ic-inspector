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
                return Number(value);
            } else if (value?._isPrincipal) {
                return Principal.fromUint8Array(value._arr).toString();
            }
            return value;
        }),
    );
}

/**
 * Output an object as a stub string, to be reimported for testing.
 */
export function dumpStub(object: any): string {
    function replacer(this: any, key: string, value: any) {
        if (typeof value === 'bigint') {
            return {
                _stub: true,
                _bigint: true,
                val: value.toString(),
            };
        } else if (value?._isPrincipal) {
            return {
                _stub: true,
                _principal: true,
                val: Principal.fromUint8Array(value._arr).toString(),
            };
        } else if (this[key] instanceof URL) {
            return {
                _stub: true,
                _url: true,
                val: value.toString()
            }
        }
        return value;
    }
    return JSON.stringify(object, replacer, 2);
}

/**
 * Read a stub string into js object.
 */
export function readStub(stub: string): any {
    function reviver(key: string, value: any) {
        if (value._stub) {
            if (value._bigint) {
                return BigInt(value.val);
            }
            if (value._principal) {
                return Principal.fromText(value.val);
            }
            if (value._url) {
                return new URL(value.val)
            }
        }
        return value;
    }
    return JSON.parse(stub, reviver);
}
