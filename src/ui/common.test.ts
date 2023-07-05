/**
 * @jest-environment jsdom
 */
import { formatBytes } from './common';

describe('formatBytes', () => {
    it('returns "0 Bytes" for input 0', () => {
        expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('formats bytes correctly', () => {
        expect(formatBytes(1)).toBe('1 Bytes');
        expect(formatBytes(1024)).toBe('1 KB');
        expect(formatBytes(1024 * 1024)).toBe('1 MB');
    });

    it('respects decimal places', () => {
        expect(formatBytes(1500, 0)).toBe('1 KB');
        expect(formatBytes(1500, 2)).toBe('1.46 KB');
    });

    it('handles large inputs', () => {
        expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
        expect(formatBytes(1024 * 1024 * 1024 * 1024 * 1024)).toBe('1 PB');
    });

    it('handles negative inputs', () => {
        expect(formatBytes(-1500)).toBe('-1.46 KB');
    });

    it('handles non-integer inputs', () => {
        expect(formatBytes(1024.7)).toBe('1 KB');
    });
});
