/**
 * @jest-environment jsdom
 */
import { Stubs, parseStub } from '../stubs/messages';
import { transform, pretty } from './common';
import { MessageEntry } from './logging/messages';

describe('transform pretty', () => {
    it('transforms a bigint response', () => {
        const entry = parseStub(Stubs.likes_count) as MessageEntry;
        const response = Object.values(entry.requests)[0]?.response;
        if (!('reply' in response))
            throw new Error('Unexpected: reply should be defined in response.');
        const { result } = transform(response.reply, pretty);
        expect(result).toEqual(0n);
    });

    it('transforms an array payload', () => {
        const entry = parseStub(Stubs.dscvr_tipsOfContentIDs) as MessageEntry;
        const payload = Object.values(entry.requests)[0]?.request;
        if (!('args' in payload))
            throw new Error('Unexpected: args should be defined in payload.');
        const { result } = transform(payload.args, pretty);
        expect(Array.isArray(result)).toBe(true);
    });
});
