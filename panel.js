console.log('Hello From The Panel');

// Decode and log Dfinity CBOR/Candid network events.
const log = [];
chrome.devtools.network.onRequestFinished.addListener(
    async function (request) {

        // Look for a cbor content type header.
        const isCBOR = request.response.headers
            .find(x => x.name === 'content-type')
            ?.value === 'application/cbor';

        if (isCBOR) {
            request.getContent((content, encoding) => {

                if (encoding !== 'base64') {
                    // Janky AF, but AFAIK all IC responses are b64 encoded.
                    return
                };

                // Assumption from here is that this is an IC request.

                // Chrome gives us the request body decoded into utf8.
                // That's busted, so we reencode it.
                const requestB64 = btoa(request?.request?.postData?.text);

                const requestBytes = _base64ToBytes(requestB64);
                // const requestHex = toHexString(requestBytes);
                const requestCBOR = CBOR.decode(requestBytes.buffer);

                const responseBytes = _base64ToBytes(content);
                // const responseHex = toHexString(responseBytes);
                const responseCBOR = CBOR.decode(responseBytes.buffer);

                log.push({
                    url: request.request.url,
                    request: requestCBOR,
                    response: responseCBOR,
                });

                document.getElementById('log').innerHTML = renderLog(log);

            });
        };
    }
);

// Log renderer
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