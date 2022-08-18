import { Principal } from "@dfinity/principal";

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
                val: value.toString(),
            };
        } else if (this[key] instanceof Date) {
            return {
                _stub: true,
                _date: true,
                value: value,
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
        if (value?._stub) {
            if (value._bigint) {
                return BigInt(value.val);
            }
            if (value._principal) {
                return Principal.fromText(value.val);
            }
            if (value._url) {
                return new URL(value.val);
            }
            if (value._date) {
                return new Date(value.val);
            }
        }
        return value;
    }
    return JSON.parse(stub, reviver);
}