/**
 * @jest-environment jsdom
 */
import Ajv from 'ajv';
import Schema from './message.schema.json';
import { mockRequestId, Stubs } from '.';

const validate = new Ajv().compile(Schema);

test('Stubs are valid', () => {
    Object.entries(Stubs).forEach(([key, stub]) => {
        const valid = validate(stub);
        if (!valid) console.error(`Error with stub: ${key}`, validate.errors);
        expect(valid).toBeTruthy();
    });
});

test('mock requestid', () => {
    const id = mockRequestId();
    expect(/[0-9A-Fa-f]{64}/g.test(id)).toBeTruthy();
});
