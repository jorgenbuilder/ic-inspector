import { RequestType, DecodedRequest, DecodedResponse } from "../capture";
import { CallerData, CanisterData, getCallerData, getMethodData, MethodData } from "./common";
import { MessageId } from "./messages";

export type RequestId = string;

export interface RequestRepository {
    [key: string]: RequestEntry;
}

interface RequestEntry {
    meta: RequestMetaData;
    caller: CallerData;
    canister: CanisterData;
    method: MethodData;
    timing: RequestTimingData;
    request: DecodedRequest;
    response: DecodedResponse;
}

interface RequestMetaData {
    requestId: RequestId;
    originalRequestId: MessageId;
    type: RequestType;
    boundary: URL;
}

interface RequestTimingData {
    timestamp: Date;
    durationMs?: number;
}

export function newRequestEntry(
    request: DecodedRequest,
    response: DecodedResponse,
    canister: CanisterData,
): RequestEntry {
    const meta = newRequestMetaData(request);
    const timing = newRequestTiming(request, response);
    const caller = getCallerData(request.sender);
    const method = getMethodData(request);
    return {
        caller,
        method,
        canister,
        meta,
        timing,
        request,
        response,
    };
}

function newRequestMetaData(request: DecodedRequest): RequestMetaData {
    const originalRequestId = request.message;
    const requestId = request.requestId;
    const type = request.requestType;
    const boundary = request.boundary;
    return {
        originalRequestId,
        requestId,
        type,
        boundary,
    };
}

function newRequestTiming(
    request: DecodedRequest,
    response: DecodedResponse,
): RequestTimingData {
    return {
        timestamp: new Date(),
    };
}