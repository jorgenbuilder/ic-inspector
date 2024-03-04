import {
    sandboxHandleEvalInterface,
    SandboxRequestEvalInterface,
    stripIdl,
} from './interfaces';
import { Stubs } from '../../stubs/interfaces';

test('Candid javascript interface evaluation', () => {
    for (const [name, stub] of Object.entries(Stubs)) {
        try {
            const request: SandboxRequestEvalInterface = {
                type: 'evalInterface',
                data: {
                    canisterId: name,
                    boundryUrl: "https://ic0.app/",
                    javascriptAsString: stub,
                },
            };
            sandboxHandleEvalInterface(request);
        } catch (e) {
            console.error(name);
            throw e;
        }
    }
});

test('stripIdl removes all exports', () => {
    for (const stub of Object.values(Stubs)) {
        const stripped = stripIdl(stub);
        expect(stripped).not.toContain('export');
    }
});
