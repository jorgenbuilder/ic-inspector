
const boundaryNodeRegex =
/https?:\/\/(?:.+)?((?:ic0\.app|dfinity.network)|localhost:[0-9]+)\/api\/v2\/canister\/(.+)\/(query|call|read_state)/;

/**
* Determines whether a URL represents a request to an internet computer boundary node.
*/
export function isBoundaryNodeURL(url: string): boolean {
return Boolean(url.match(boundaryNodeRegex));
}

/**
 * Determines whether a network event is an internet computer request/response that we want to record.
 */
 export function shouldCapture(event: chrome.devtools.network.Request) {
    return (
        isBoundaryNodeURL(event.request.url) && event.request.method === 'POST'
    );
}