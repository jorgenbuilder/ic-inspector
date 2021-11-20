// Load Candid WASM
fetch(chrome.runtime.getURL("candid.wasm"))
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes))
    .then(results => results.instance.exports)
    .then(initialize);

function initialize(didc) {
    console.log(didc);

    const log = [];

    // Start capture
    chrome.devtools.network.onRequestFinished.addListener((request) => capture(didc, log, request));
};

// Decode and log Dfinity CBOR/Candid network events.
function capture(didc, log, request) {

    // Look for a cbor content type header.
    const isCBOR = request.response.headers
        .find(x => x.name === 'content-type')
        ?.value === 'application/cbor';

    function decode(value) {
        // TODO
        // return didc.did_to_js(value);
        return "CANDID VALUE";
    };

    if (isCBOR) {
        request.getContent((content, encoding) => {

            if (encoding !== 'base64') {
                // Janky AF, but AFAIK all IC responses are b64 encoded.
                return
            };

            // Assumption from here is that this is an IC request.

            // Chrome gives us the request body decoded into utf8?
            // It's busted, so we reencode it.
            const requestB64 = btoa(request?.request?.postData?.text);

            // Decode request.
            const requestBytes = _base64ToBytes(requestB64);
            const requestCBOR = CBOR.decode(requestBytes.buffer);
            // const requestHex = toHexString(requestBytes);

            // Decode response.
            const responseBytes = _base64ToBytes(content);
            const responseCBOR = CBOR.decode(responseBytes.buffer);
            // const responseHex = toHexString(responseBytes);

            // Find candid values.
            // Assumption: all candid values are Uint8Array and all Uint8Array values are candid.
            function findCandid(object) {
                let candidFields = {};
                for (let [key, value] of Object.entries(object)) {
                    // Capture and decode Uint8Arrays.
                    if (value instanceof Uint8Array) {
                        candidFields[key] = decode(Uint8Array.from(value));
                        // Recurse downward.
                    } else if (typeof value === 'object') {
                        candidFields[key] = findCandid(value);
                    };
                };
                return candidFields;
            };

            const requestCandid = findCandid(requestCBOR);
            const responseCandid = findCandid(responseCBOR);

            const decodedRequest = mergeDeep({}, requestCBOR, requestCandid);
            const decodedResponse = mergeDeep({}, responseCBOR, responseCandid);

            // console.log(requestCandid, requestCBOR, decodedRequest);

            log.push({
                url: request.request.url,
                request: decodedRequest,
                response: decodedResponse,
            });

            document.getElementById('log').innerHTML = renderLog(log);

        });
    };
}

// Render decoded logs
const renderLog = (log) => `${log.map(entry => `
    <div>
        <div><strong>URL: </strong>${entry.url}</div>
        <div><strong>Request: </strong>${JSON.stringify(entry.request, undefined, 4)}</div>
        <div><strong>Response: </strong>${JSON.stringify(entry.response, undefined, 4)}</div>
    </div>
`).join('<hr />')}`;

// Converting things...
function _base64ToBytes(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes;
}

function toHexString(byteArray) {
    return Array.from(byteArray).map(x => {
        return byteToHex(x);
    }).join(' ');
}

var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

function byteToHex(b) {
    return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
    return (item && typeof item === 'object');
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
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