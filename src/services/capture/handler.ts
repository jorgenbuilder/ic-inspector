import { ActorHelper } from '../../api/actors';
import { DecodedRequest, decodeRequest } from './request';
import { DecodedResponse, decodeResponse } from './response';
import { shouldCapture } from './select';

/**
 * Filter and decode internet computer message from a chrome network event.
 */
export async function captureInternetComputerMessageFromNetworkEvent(
    event: chrome.devtools.network.Request,
): Promise<
    | {
        request: DecodedRequest;
        response: DecodedResponse;
    }
    | undefined
> {
    if (!shouldCapture(event)) return;

    console.debug('Full network event stub', event);


    const request = await decodeRequest(event);
    const actorHelper = new ActorHelper(request.boundary);
    const response = await decodeResponse(event, request, actorHelper);

    return { request, response };
}
