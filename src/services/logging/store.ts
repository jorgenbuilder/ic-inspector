import create from 'zustand';
import { DecodedRequest, DecodedResponse } from '../capture';
import { getCanisterData } from './common';
import {
    MessageRepository,
    MessageEntry,
    MessageId,
    getMessageRepositoryUpdate,
} from './messages';
import { ActorHelper } from '../../api/actors';

export default create<{
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

        const actorHelper = new ActorHelper(request.boundary);
        const asyncData = {
            canister: await getCanisterData(request.canisterId, actorHelper),
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
