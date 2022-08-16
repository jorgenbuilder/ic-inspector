/**
 * @jest-environment jsdom
 */
import Ajv from 'ajv';
import Schema from './message.schema.json';
import { Stubs } from ".";

const validate = new Ajv().compile(Schema);

test("Stubs are valid", () => {
    Object.entries(Stubs).forEach(([key, stub]) => {
        const valid = validate(stub)
        if (!valid) console.error(`Error with stub: ${key}`, validate.errors)
        expect(valid).toBeTruthy()
    })
})