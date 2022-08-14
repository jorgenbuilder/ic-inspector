/**
 * @jest-environment jsdom
 */
import { isBoundaryNodeURL } from './capture';

describe('isBoundaryNodeURL', () => {
    it('matches known boundary node URLs', () => {
        [
            'https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/call',
            'https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query',
            'https://raw.ic0.app/api/v2/canister/upsxs-oyaaa-aaaah-qcaua-cai/read_state',
            'https://ic0.app/api/v2/canister/upsxs-oyaaa-aaaah-qcaua-cai/read_state',
            'https://boundary.ic0.app/api/v2/canister/upsxs-oyaaa-aaaah-qcaua-cai/read_state',
            'https://www.ic0.app/api/v2/canister/upsxs-oyaaa-aaaah-qcaua-cai/read_state',
            'http://localhost:8000/api/v2/canister/upsxs-oyaaa-aaaah-qcaua-cai/read_state',
        ].forEach((url) => {
            const result = isBoundaryNodeURL(url);
            if (!result) console.error(url);
            expect(result).toBeTruthy();
        });
    });
    it('does not match other URLs', () => {
        ['https://google.com', 'https://smartcontracts.org'].forEach((url) =>
            expect(isBoundaryNodeURL(url)).toBeFalsy(),
        );
    });
});
