import sizeof from 'object-sizeof';
import { dumpStub } from '../../stubs';
import { CandidDecodeResult } from '../candid';
import {
    DecodedRequest,
    DecodedResponse,
    DecodedReadRequest,
    RejectedResponse,
} from '../capture';
import {
    CanisterData,
    MethodData,
    CallerData,
    isResponseComplete,
    getCallerData,
    getMethodData,
    LOG_MAX,
} from './common';
import { newRequestEntry, RequestId, RequestRepository } from './requests';

export type MessageId = RequestId;
export type MessageType = 'update' | 'query';
export type MessageStatus = 'pending' | 'replied' | 'rejected';

export interface MessageRepository {
    [key: string]: MessageEntry;
}

export interface MessageEntry {
    meta: MessageMetaData;
    canister: CanisterData;
    method: MethodData;
    caller: CallerData;
    timing: MessageTimingData;
    requests: RequestRepository;
}

interface MessageTimingData {
    timestamp: Date;
    durationMs?: number;
    requestCount: number;
}

interface MessageMetaData {
    originalRequestId: MessageId;
    type: MessageType;
    status: MessageStatus;
    consensus: boolean; // I think I can do this simply based on request type === update?
    verified: null; // I need to implement certificate verification for this. Will be boolean on completion.
    boundary: URL;
    responseSize?: number;
}

export function getMessageRepositoryUpdate(
    messages: MessageRepository,
    update: {
        request: DecodedRequest;
        response: DecodedResponse;
    },
    asyncData: {
        canister: CanisterData;
    },
): MessageRepository {
    const { request, response } = update;
    const messageId: MessageId = request.message;
    const message =
        messageId in messages
            ? getMessageEntryUpdate(messages[messageId], update, asyncData)
            : newMessageEntry(request, response, asyncData.canister);

    if (isResponseComplete(response)) {
        console.groupCollapsed(
            `Completed message stub (${message.canister.identifier}: ${message.method.name})`,
        );
        console.log(dumpStub(message));
        console.groupEnd();
    }

    const result = { ...messages, [messageId]: message };
    const ordered = Object.entries(result).sort(
        (a, b) =>
            a[1].timing.timestamp.getTime() - b[1].timing.timestamp.getTime(),
    );
    while (Object.values(result).length > LOG_MAX) {
        delete result[ordered.shift()?.[0] as string];
    }

    return result;
}

function newMessageEntry(
    request: DecodedRequest,
    response: DecodedResponse,
    canister: CanisterData,
): MessageEntry {
    const meta = newMessageMetaData(request, response);
    const requests = newRequestsRepository(request, response, canister);
    const timing = newMessageTiming(request, response);

    const caller = getCallerData(request.sender);
    const method = getMethodData(request);
    return {
        caller,
        canister,
        meta,
        method,
        timing,
        requests,
    };
}

function newMessageMetaData(
    request: DecodedRequest,
    response: DecodedResponse,
): MessageMetaData {
    const originalRequestId = request.message;
    const type = request.requestType === 'query' ? 'query' : 'update';
    const status = getMessageStatus(response);
    const consensus = request.requestType !== 'query';
    const verified = null;
    const boundary = request.boundary;
    const responseSize =
        'reply' in response ? sizeof(response.reply.result) : undefined;
    return {
        originalRequestId,
        type,
        status,
        consensus,
        verified,
        boundary,
        responseSize,
    };
}

function newMessageTiming(
    request: DecodedRequest,
    response: DecodedResponse,
): MessageTimingData {
    return {
        timestamp: new Date(),
        requestCount: 1,
    };
}

function getMessageEntryUpdate(
    message: MessageEntry,
    update: {
        request: DecodedRequest;
        response: DecodedResponse;
    },
    asyncData: {
        canister: CanisterData;
    },
): MessageEntry {
    const { request, response } = update;
    const { canister, caller, method } = message;
    const timing = getMessageTimingUpdate(message.timing, update);
    const meta = newMessageMetaData(request, response);
    const requests = getRequestRepositoryUpdate(
        message.requests,
        update,
        asyncData,
    );
    return {
        canister,
        caller,
        method,
        timing,
        meta,
        requests,
    };
}

function getMessageTimingUpdate(
    timing: MessageTimingData,
    update: { request: DecodedRequest; response: DecodedResponse },
): MessageTimingData {
    const { response } = update;
    return {
        ...timing,
        requestCount: timing.requestCount + 1,
        durationMs: isResponseComplete(response)
            ? new Date().getTime() - timing.timestamp.getTime()
            : undefined,
    };
}

function newRequestsRepository(
    request: DecodedRequest,
    response: DecodedResponse,
    canister: CanisterData,
): RequestRepository {
    const requestId = request.requestId;
    return {
        [requestId]: newRequestEntry(request, response, canister),
    };
}

function getRequestRepositoryUpdate(
    requests: RequestRepository,
    update: {
        request: DecodedRequest;
        response: DecodedResponse;
    },
    asyncData: {
        canister: CanisterData;
    },
): RequestRepository {
    const { request, response } = update;
    const { canister } = asyncData;
    const requestId = request.requestId;
    return {
        ...requests,
        [requestId]: newRequestEntry(request, response, canister),
    };
}

function getMessageStatus(response: DecodedResponse): MessageStatus {
    switch (response.status) {
        case 'replied':
        case 'done': // TODO: this case will actually feel like an error to the developer
            return 'replied';
        case 'rejected':
            return 'rejected';
        default:
            return 'pending';
    }
}

export function getMessageRequest(message: MessageEntry): DecodedReadRequest {
    const request: DecodedReadRequest = (function () {
        const request =
            message.requests[message.meta.originalRequestId].request;
        if (!('args' in request))
            throw new Error(
                'Unexpected: args should always be defined in initial request.',
            );
        return request;
    })();
    return request;
}

export function getMessageResponse(
    message: MessageEntry,
): DecodedResponse | undefined {
    return Object.values(message.requests).find((request) =>
        isResponseComplete(request.response),
    )?.response;
}

export function getMessageArgs(message: MessageEntry): CandidDecodeResult {
    const request = getMessageRequest(message);
    return request.args;
}

export function getMessageReply(
    message: MessageEntry,
): CandidDecodeResult | RejectedResponse | undefined {
    const response = getMessageResponse(message);
    if (!response) return undefined;
    if ('reply' in response) {
        return response.reply;
    } else if ('code' in response) {
        return response;
    }
    throw new Error(
        'Unreachable: message reply must be one of null, replied, rejected.',
    );
}
