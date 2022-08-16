/**
 * @jest-environment jsdom
 */

import { Principal } from '@dfinity/principal';
import { dumpStub, readStub } from './common';

test('stub utils handle principals', () => {
    const asText =
        'k6ut3-4axpf-t6vak-hoh4w-2zroe-mmglc-nl7ab-vrl5w-mmvsf-i4liy-dqe';
    const principal = Principal.fromText(asText);
    const object = {
        prop: { principal },
    };
    const processed = readStub(dumpStub(object));
    expect(processed.prop.principal.toText()).toBe(asText);
});

test('stub utils handle bigints', () => {
    const value = BigInt(100);
    const object = { value };
    const processed = readStub(dumpStub(object));
    expect(processed.value === value).toBeTruthy();
});

test('stub utils handle URLs', () => {
    const value = new URL("https://google.ca");
    const object = { value };
    const processed = readStub(dumpStub(object));
    expect(processed.value.host === value.host).toBeTruthy();
});
