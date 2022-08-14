import { Principal } from '@dfinity/principal';
import create from 'zustand';
import {
    DecodedRequest,
    DecodedResponse,
    RequestType,
} from '../services/capture';
import { mapOptional } from '../services/common';
import { getDabCanisterData } from '../services/dab';

type RequestId = string;
type MessageId = RequestId;
type MessageType = 'update' | 'query';
export type MessageStatus = 'pending' | 'replied' | 'rejected';

interface MessageRepository {
    [key: MessageId]: MessageEntry;
}

interface RequestRepository {
    [key: RequestId]: RequestEntry;
}

export interface MessageEntry {
    meta: MessageMetaData;
    canister: CanisterData;
    method: MethodData;
    caller: CallerData;
    timing: MessageTimingData;
    requests: RequestRepository;
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
}

interface CallerData {
    identifier: Principal;
    isAnonymous: boolean;
}

interface CanisterData {
    identifier: string;
    // dab-js
    // version?: number;
    name?: string;
    url?: string;
    description?: string;
    logoUrl?: string;
    subnet: string;
    moduleHash: string;
    controllers: string[];
}

interface MethodData {
    name: string;
    query: boolean;
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

const logRepository = create<{
    messages: MessageRepository;
    focusedMessage?: MessageEntry;
    log: (request: DecodedRequest, response: DecodedResponse) => void;
    focus: (message?: MessageId) => void;
    clear: () => void;
}>((set, get) => ({
    messages: {},
    clear() {
        set({ messages: {} });
    },
    async log(request, response) {
        // We don't want async in out update logic because it could cause stale state in parallel updates, so we put it up here.
        const asyncData = {
            canister: await getCanisterData(request.canisterId),
        };
        const { messages } = get();
        const update = getMessageRepositoryUpdate(
            messages,
            { request, response },
            asyncData,
        );
        set(() => ({ messages: update }));
    },
    focus(message) {
        const { messages } = get();
        set({ focusedMessage: message ? messages[message] : undefined });
    },
}));

export default logRepository;

function getMessageRepositoryUpdate(
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

    return { ...messages, [messageId]: message };
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
    return {
        originalRequestId,
        type,
        status,
        consensus,
        verified,
        boundary,
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

function newRequestEntry(
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

async function getCanisterData(canisterId: string): Promise<CanisterData> {
    const dab = await getDabCanisterData(canisterId);
    const { subnet, moduleHash, controllers } = await getIcApiCanisterData(
        canisterId,
    );
    return {
        identifier: canisterId,
        subnet,
        moduleHash,
        controllers,
        name: dab?.name,
        url: dab?.frontend ? mapOptional(dab.frontend) : undefined,
        description: dab?.description,
        logoUrl: dab?.thumbnail,
    };
}

async function getIcApiCanisterData(canisterId: string) {
    const response: {
        canister_id: string;
        controllers: string[];
        module_hash: string;
        subnet_id: string;
    } = await fetch(
        `https://ic-api.internetcomputer.org/api/v3/canisters/${canisterId}`,
    ).then((r) => r.json());
    for (const field of ['subnet_id', 'controllers', 'module_hash']) {
        if (!(field in response)) {
            throw new Error(`Expected "${field}" in IC API response.`);
        }
    }
    return {
        subnet: response.subnet_id,
        moduleHash: response.module_hash,
        controllers: response.controllers,
    };
}

function getCallerData(caller: Principal): CallerData {
    return {
        identifier: caller,
        isAnonymous: caller.isAnonymous(),
    };
}

function getMethodData(request: DecodedRequest): MethodData {
    return {
        name: request.method,
        // TODO: I'd like to identify whether a method is _capable_ of a query, not whether a call was made as a query. Can probably get this from idl via sandbox.
        query: request.requestType === 'query',
    };
}

function isResponseComplete(response: DecodedResponse): boolean {
    return ['replied', 'done', 'rejected'].includes(response.status);
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

export function getMessageRequest(message: MessageEntry): RequestEntry {
    return message.requests[message.meta.originalRequestId];
}

export function getMessageResponse(
    message: MessageEntry,
): RequestEntry | undefined {
    return Object.values(message.requests).find((request) =>
        isResponseComplete(request.response),
    );
}
