import CBOR from 'cbor';
import { decode } from './candid';

export interface LogEvent {
    url         : string;
    request     : any;
    response    : any;
}

// Decode and log Dfinity CBOR/Candid network events.
export default function capture(
    request     : chrome.devtools.network.Request,
    log         : LogEvent[],
    callback?   : (event : LogEvent) => void,
) : void {

    // Look for a cbor content type header.
    const isCBOR = request.response.headers
        .find(x => x.name === 'content-type')
        ?.value === 'application/cbor';

    if (isCBOR) {
        request.getContent((content, encoding) => {

            if (encoding !== 'base64') {
                // AFAIK all IC responses are b64 encoded.
                return
            }

            // Assumption from here is that this is an IC request.

            // Chrome gives us the request body decoded into utf8?
            // It's busted, so we reencode it.
            const requestB64 = btoa(request?.request?.postData?.text as string);

            // Decode request.
            const requestBytes = _base64ToBytes(requestB64);
            const requestCBOR = CBOR.decode(requestBytes.buffer);
            // const requestHex = toHexString(requestBytes);

            // Decode response.
            const responseBytes = _base64ToBytes(content);
            const responseCBOR = CBOR.decode(responseBytes.buffer);
            // const responseHex = toHexString(responseBytes);

            // Find byte fields.
            function findByteFields (object : any) {
                const byteFields : any = {};
                for (const [key, value] of Object.entries(object)) {
                    if (value instanceof Uint8Array) {
                        // Capture Uint8Arrays.
                        byteFields[key] = value;
                    } else if (typeof value === 'object') {
                        // Recurse downward.
                        byteFields[key] = findByteFields(value);
                    }
                }
                return byteFields;
            }

            // Find candid values.
            const decoder = new TextDecoder();
            function findCandid(object : any) {
                const magic = 'DIDL';
                const candidFields : any = {};
                for (const [key, value] of Object.entries(object)) {
                    if (value instanceof Uint8Array) {
                        // Capture and Candid values.
                        const magicBuffer = value.subarray(0, 4);
                        if (decoder.decode(magicBuffer) === magic) {
                            candidFields[key] = (decode(value));
                        } else {
                            candidFields[key] = value;
                        }
                    } else if (typeof value === 'object') {
                        // Recurse downward.
                        candidFields[key] = findCandid(value);
                    }
                }
                return candidFields;
            }

            function decodeDfinityObject (obj : {[key : string]: any}) {
                const response : { [key : string] : any} = {};
                for (const [key, value] of Object.entries(obj)) {
                    if (value?._isPrincipal) {
                        response[key] = value?.toText();
                    } else if (typeof value === 'bigint') {
                        response[key] = Number(value);
                    } else if (value?._isBuffer) {
                        response[key] = value;
                    } else if (typeof value === 'object') {
                        response[key] = decodeDfinityObject(value);
                    } else {
                        response[key] = value;
                    }
                }
                return response;
            }

            const requestByteFields = findByteFields(requestCBOR);
            const requestCandid = findCandid(requestByteFields);
            const responseByteFields = findByteFields(responseCBOR);
            const responseCandid = findCandid(responseByteFields);

            const decodedRequest = mergeDeep({}, requestCBOR, requestCandid);
            const decodedResponse = mergeDeep({}, responseCBOR, responseCandid);

            const event = {
                url: request.request.url,
                request: decodeDfinityObject(decodedRequest),
                response: decodeDfinityObject(decodedResponse),
            };

            log.push(event);

            if (callback) {
                callback(event);
            }

        });
    }
}

// Converting things...
function _base64ToBytes(base64 : string) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

// function toHexString(byteArray : Uint8Array) {
//     return Array.from(byteArray).map(x => {
//         return byteToHex(x);
//     }).join(' ');
// }

// const hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

// function byteToHex(b : number) {
//     return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
// }

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item : any) {
    return (item && !Array.isArray(item) && typeof item === 'object');
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target : any, ...sources : any[]) : any {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}