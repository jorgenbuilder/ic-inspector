const x = {
    _initiator: {
        type: 'script',
        stack: {
            callFrames: [
                {
                    functionName: 'query',
                    scriptId: '4',
                    url: 'https://metascore.app/450-b86741fe427baed999c7.js',
                    lineNumber: 1,
                    columnNumber: 30838,
                },
            ],
            parent: {
                description: 'await',
                callFrames: [
                    {
                        functionName: '',
                        scriptId: '4',
                        url: 'https://metascore.app/450-b86741fe427baed999c7.js',
                        lineNumber: 1,
                        columnNumber: 120000,
                    },
                    {
                        functionName: 'n',
                        scriptId: '4',
                        url: 'https://metascore.app/450-b86741fe427baed999c7.js',
                        lineNumber: 1,
                        columnNumber: 120856,
                    },
                    {
                        functionName: '',
                        scriptId: '3',
                        url: 'https://metascore.app/862-76a55526840f9da1c88b.js',
                        lineNumber: 0,
                        columnNumber: 1818,
                    },
                ],
                parent: {
                    description: 'await',
                    callFrames: [
                        {
                            functionName: '',
                            scriptId: '3',
                            url: 'https://metascore.app/862-76a55526840f9da1c88b.js',
                            lineNumber: 0,
                            columnNumber: 2926,
                        },
                    ],
                },
            },
        },
    },
    _priority: 'High',
    _resourceType: 'fetch',
    cache: {},
    connection: '7428',
    request: {
        method: 'POST',
        url: 'https://ic0.app/api/v2/canister/t6ury-eiaaa-aaaaj-qabgq-cai/query',
        httpVersion: 'http/2.0',
        headers: [
            {
                name: ':authority',
                value: 'ic0.app',
            },
            {
                name: ':method',
                value: 'POST',
            },
            {
                name: ':path',
                value: '/api/v2/canister/t6ury-eiaaa-aaaaj-qabgq-cai/query',
            },
            {
                name: ':scheme',
                value: 'https',
            },
            {
                name: 'accept',
                value: '*/*',
            },
            {
                name: 'accept-encoding',
                value: 'gzip, deflate, br',
            },
            {
                name: 'accept-language',
                value: 'en,en-US;q=0.9,da;q=0.8,es-PE;q=0.7,es;q=0.6,en-CA;q=0.5',
            },
            {
                name: 'cache-control',
                value: 'no-cache',
            },
            {
                name: 'content-length',
                value: '557',
            },
            {
                name: 'content-type',
                value: 'application/cbor',
            },
            {
                name: 'origin',
                value: 'https://metascore.app',
            },
            {
                name: 'pragma',
                value: 'no-cache',
            },
            {
                name: 'referer',
                value: 'https://metascore.app/',
            },
            {
                name: 'sec-fetch-dest',
                value: 'empty',
            },
            {
                name: 'sec-fetch-mode',
                value: 'cors',
            },
            {
                name: 'sec-fetch-site',
                value: 'cross-site',
            },
            {
                name: 'user-agent',
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            },
        ],
        queryString: [],
        cookies: [],
        headersSize: -1,
        bodySize: 580,
        postData: {
            mimeType: 'application/cbor',
            text: 'ÙÙ÷¡gcontent¦cargY\u0001µDIDL\u0004m{l\u0002\u0000q\u0001qm\u0001l\u0004ïÖä\u0002qáíëJq¢õí\u0004\u0000Æ¤¡\u0006\u0002\u0001\u0003\u001c/assets/favicon.8b6d5958.svg\u0003GET\u0000\u0006\u0006accept@image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8\tsec-ch-uaB"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"\u0010sec-ch-ua-mobile\u0002?0\u0012sec-ch-ua-platform\t"Windows"\nuser-agentoMozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36\u000fAccept-Encoding\u0017gzip, deflate, identitykcanister_idJ\u0000\u0000\u0000\u0000\u00010\u0000M\u0001\u0001ningress_expiry\u001b\u0017\n®Ö\u0010+ö@kmethod_namelhttp_requestlrequest_typeequeryfsenderA\u0004',
        },
    },
    response: {
        status: 200,
        statusText: '',
        httpVersion: 'http/2.0',
        headers: [
            {
                name: 'access-control-allow-headers',
                value: 'Accept, Authorization, Content-Type',
            },
            {
                name: 'access-control-allow-methods',
                value: 'POST, GET',
            },
            {
                name: 'access-control-allow-origin',
                value: '*',
            },
            {
                name: 'content-length',
                value: '5536',
            },
            {
                name: 'content-type',
                value: 'application/cbor',
            },
            {
                name: 'content-type',
                value: 'application/cbor',
            },
            {
                name: 'date',
                value: 'Fri, 12 Aug 2022 19:10:08 GMT',
            },
            {
                name: 'server',
                value: 'nginx/1.21.3',
            },
            {
                name: 'x-content-type-options',
                value: 'nosniff',
            },
            {
                name: 'x-ic-canister-id',
                value: '000000000130004d0101',
            },
            {
                name: 'x-ic-node-id',
                value: 'ioeul-7syty-u44zq-pln5y-beqzg-l2p6m-gpweg-z3e54-afs7e-b476n-7qe',
            },
            {
                name: 'x-ic-subnet-id',
                value: 'jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe',
            },
        ],
        cookies: [],
        content: {
            size: 5536,
            mimeType: 'application/cbor',
        },
        redirectURL: '',
        headersSize: -1,
        bodySize: -1,
        _transferSize: 5914,
        _error: null,
    },
    serverIPAddress: '86.109.1.102',
    startedDateTime: '2022-08-12T19:10:07.057Z',
    time: 1084.7839999996722,
    timings: {
        blocked: 540.2590000000142,
        dns: -1,
        ssl: -1,
        connect: -1,
        send: 0.506,
        wait: 529.5679999996497,
        receive: 14.451000000008207,
        _blocked_queueing: 540.0700000000143,
    },
};
