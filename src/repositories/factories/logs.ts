import { DecodedRequest } from "../../services/capture";
import { MessageEntry } from "../logs";

export function randomLog(): MessageEntry {
    const logs = Object.values(logsStub);
    const log = logs[Math.floor(logs.length * Math.random())]
    return {
        ...log,
        meta: {
            ...log.meta,
            boundary: new URL(log.meta.boundary),
        },
        timing: {
            ...log.timing,
            timestamp: new Date(log.timing.timestamp)
        }
    } as unknown as MessageEntry;
}

// export function requestFactory (): DecodedRequest {
//     const message = string;
//     const requestId = string;
//     const canisterId = string;
//     const method = string;
//     const sender = Principal;
//     const requestType = RequestType;
//     const ingressExpiry = Expiry;
//     const boundary = URL;
//     return {}
    
// }

const e = {
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

export const logsStub = {
    "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa": {
        "canister": {
            "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
            "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
            "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
            "controllers": [
                "tmsgb-iyaaa-aaaaj-qabfq-cai"
            ]
        },
        "caller": {
            "identifier": "2vxsx-fae",
            "isAnonymous": true
        },
        "method": {
            "name": "getPlayerCount",
            "query": false
        },
        "timing": {
            "timestamp": "2022-08-14T14:46:00.666Z",
            "requestCount": 3,
            "durationMs": 3214
        },
        "meta": {
            "originalRequestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
            "type": "update",
            "status": "replied",
            "consensus": true,
            "verified": null,
            "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/read_state"
        },
        "requests": {
            "41187fe4422f754d7245d1d3cdf53476908e925d7bbe82b5832e9a77bc75a7be": {
                "caller": {
                    "identifier": "2vxsx-fae",
                    "isAnonymous": true
                },
                "method": {
                    "name": "getPlayerCount",
                    "query": false
                },
                "canister": {
                    "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
                    "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
                    "controllers": [
                        "tmsgb-iyaaa-aaaaj-qabfq-cai"
                    ]
                },
                "meta": {
                    "originalRequestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "41187fe4422f754d7245d1d3cdf53476908e925d7bbe82b5832e9a77bc75a7be",
                    "type": "read_state",
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/read_state"
                },
                "timing": {
                    "timestamp": "2022-08-14T14:46:00.666Z"
                },
                "request": {
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/read_state",
                    "message": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "41187fe4422f754d7245d1d3cdf53476908e925d7bbe82b5832e9a77bc75a7be",
                    "canisterId": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "method": "getPlayerCount",
                    "sender": "2vxsx-fae",
                    "requestType": "read_state",
                    "ingressExpiry": "1660488598851000000",
                    "paths": [
                        [
                            {
                                "0": 114,
                                "1": 101,
                                "2": 113,
                                "3": 117,
                                "4": 101,
                                "5": 115,
                                "6": 116,
                                "7": 95,
                                "8": 115,
                                "9": 116,
                                "10": 97,
                                "11": 116,
                                "12": 117,
                                "13": 115
                            },
                            {
                                "0": 215,
                                "1": 255,
                                "2": 9,
                                "3": 200,
                                "4": 206,
                                "5": 141,
                                "6": 238,
                                "7": 170,
                                "8": 157,
                                "9": 247,
                                "10": 253,
                                "11": 8,
                                "12": 230,
                                "13": 162,
                                "14": 69,
                                "15": 219,
                                "16": 164,
                                "17": 152,
                                "18": 37,
                                "19": 74,
                                "20": 159,
                                "21": 189,
                                "22": 189,
                                "23": 244,
                                "24": 89,
                                "25": 208,
                                "26": 11,
                                "27": 181,
                                "28": 117,
                                "29": 250,
                                "30": 14,
                                "31": 250
                            }
                        ]
                    ]
                },
                "response": {
                    "status": "unknown"
                }
            },
            "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa": {
                "caller": {
                    "identifier": "2vxsx-fae",
                    "isAnonymous": true
                },
                "method": {
                    "name": "getPlayerCount",
                    "query": false
                },
                "canister": {
                    "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
                    "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
                    "controllers": [
                        "tmsgb-iyaaa-aaaaj-qabfq-cai"
                    ]
                },
                "meta": {
                    "originalRequestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "type": "call",
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/call"
                },
                "timing": {
                    "timestamp": "2022-08-14T14:46:01.305Z"
                },
                "request": {
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/call",
                    "message": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "sender": "2vxsx-fae",
                    "requestType": "call",
                    "ingressExpiry": "1660488598522000000",
                    "canisterId": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "method": "getPlayerCount",
                    "args": {
                        "result": null,
                        "withInterface": true
                    }
                },
                "response": {
                    "status": "unknown"
                }
            },
            "dab737ca136520af846e5fe4857949364e0f9493d3f180e3b178e6694ad23f0b": {
                "caller": {
                    "identifier": "2vxsx-fae",
                    "isAnonymous": true
                },
                "method": {
                    "name": "getPlayerCount",
                    "query": false
                },
                "canister": {
                    "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
                    "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
                    "controllers": [
                        "tmsgb-iyaaa-aaaaj-qabfq-cai"
                    ]
                },
                "meta": {
                    "originalRequestId": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "dab737ca136520af846e5fe4857949364e0f9493d3f180e3b178e6694ad23f0b",
                    "type": "read_state",
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/read_state"
                },
                "timing": {
                    "timestamp": "2022-08-14T14:46:03.880Z"
                },
                "request": {
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/read_state",
                    "message": "d7ff09c8ce8deeaa9df7fd08e6a245dba498254a9fbdbdf459d00bb575fa0efa",
                    "requestId": "dab737ca136520af846e5fe4857949364e0f9493d3f180e3b178e6694ad23f0b",
                    "canisterId": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "method": "getPlayerCount",
                    "sender": "2vxsx-fae",
                    "requestType": "read_state",
                    "ingressExpiry": "1660488601823000000",
                    "paths": [
                        [
                            {
                                "0": 114,
                                "1": 101,
                                "2": 113,
                                "3": 117,
                                "4": 101,
                                "5": 115,
                                "6": 116,
                                "7": 95,
                                "8": 115,
                                "9": 116,
                                "10": 97,
                                "11": 116,
                                "12": 117,
                                "13": 115
                            },
                            {
                                "0": 215,
                                "1": 255,
                                "2": 9,
                                "3": 200,
                                "4": 206,
                                "5": 141,
                                "6": 238,
                                "7": 170,
                                "8": 157,
                                "9": 247,
                                "10": 253,
                                "11": 8,
                                "12": 230,
                                "13": 162,
                                "14": 69,
                                "15": 219,
                                "16": 164,
                                "17": 152,
                                "18": 37,
                                "19": 74,
                                "20": 159,
                                "21": 189,
                                "22": 189,
                                "23": 244,
                                "24": 89,
                                "25": 208,
                                "26": 11,
                                "27": 181,
                                "28": 117,
                                "29": 250,
                                "30": 14,
                                "31": 250
                            }
                        ]
                    ]
                },
                "response": {
                    "status": "replied",
                    "reply": {
                        "result": 2,
                        "withInterface": true
                    }
                }
            }
        }
    },
    "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d": {
        "caller": {
            "identifier": "2vxsx-fae",
            "isAnonymous": true
        },
        "canister": {
            "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
            "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
            "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
            "controllers": [
                "tmsgb-iyaaa-aaaaj-qabfq-cai"
            ]
        },
        "meta": {
            "originalRequestId": "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d",
            "type": "query",
            "status": "replied",
            "consensus": false,
            "verified": null,
            "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query"
        },
        "method": {
            "name": "getScoreCount",
            "query": true
        },
        "timing": {
            "timestamp": "2022-08-14T14:46:00.807Z",
            "requestCount": 1
        },
        "requests": {
            "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d": {
                "caller": {
                    "identifier": "2vxsx-fae",
                    "isAnonymous": true
                },
                "method": {
                    "name": "getScoreCount",
                    "query": true
                },
                "canister": {
                    "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
                    "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
                    "controllers": [
                        "tmsgb-iyaaa-aaaaj-qabfq-cai"
                    ]
                },
                "meta": {
                    "originalRequestId": "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d",
                    "requestId": "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d",
                    "type": "query",
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query"
                },
                "timing": {
                    "timestamp": "2022-08-14T14:46:00.807Z"
                },
                "request": {
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query",
                    "message": "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d",
                    "requestId": "5e8760662d8cbe9c431db858aff69fe804d19da04c5566ba42d8ea31e8462c1d",
                    "sender": "2vxsx-fae",
                    "requestType": "query",
                    "ingressExpiry": "1660488598522000000",
                    "canisterId": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "method": "getScoreCount",
                    "args": {
                        "result": null,
                        "withInterface": true
                    }
                },
                "response": {
                    "status": "replied",
                    "reply": {
                        "result": 180,
                        "withInterface": true
                    }
                }
            }
        }
    },
    "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3": {
        "caller": {
            "identifier": "2vxsx-fae",
            "isAnonymous": true
        },
        "canister": {
            "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
            "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
            "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
            "controllers": [
                "tmsgb-iyaaa-aaaaj-qabfq-cai"
            ]
        },
        "meta": {
            "originalRequestId": "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3",
            "type": "query",
            "status": "replied",
            "consensus": false,
            "verified": null,
            "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query"
        },
        "method": {
            "name": "getGames",
            "query": true
        },
        "timing": {
            "timestamp": "2022-08-14T14:46:01.427Z",
            "requestCount": 1
        },
        "requests": {
            "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3": {
                "caller": {
                    "identifier": "2vxsx-fae",
                    "isAnonymous": true
                },
                "method": {
                    "name": "getGames",
                    "query": true
                },
                "canister": {
                    "identifier": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "subnet": "jtdsg-3h6gi-hs7o5-z2soi-43w3z-soyl3-ajnp3-ekni5-sw553-5kw67-nqe",
                    "moduleHash": "5ac0453ff6787f7c5670e8bb55b5ddeb54ae6cec07ac1e9a95aee86b44988c04",
                    "controllers": [
                        "tmsgb-iyaaa-aaaaj-qabfq-cai"
                    ]
                },
                "meta": {
                    "originalRequestId": "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3",
                    "requestId": "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3",
                    "type": "query",
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query"
                },
                "timing": {
                    "timestamp": "2022-08-14T14:46:01.427Z"
                },
                "request": {
                    "boundary": "https://raw.ic0.app/api/v2/canister/tzvxm-jqaaa-aaaaj-qabga-cai/query",
                    "message": "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3",
                    "requestId": "c2a68920738032451382eb7f9f54cb61653c2ff6e307035b1cbc7295b5b36bb3",
                    "sender": "2vxsx-fae",
                    "requestType": "query",
                    "ingressExpiry": "1660488598522000000",
                    "canisterId": "tzvxm-jqaaa-aaaaj-qabga-cai",
                    "method": "getGames",
                    "args": {
                        "result": null,
                        "withInterface": true
                    }
                },
                "response": {
                    "status": "replied",
                    "reply": {
                        "result": [
                            [
                                "qxd6u-vqaaa-aaaah-qbpcq-cai",
                                {
                                    "name": "Reversi",
                                    "playUrl": "https://q6avi-dyaaa-aaaah-qbpda-cai.raw.ic0.app/",
                                    "flavorText": [
                                        "A multiplayer reversi game."
                                    ]
                                }
                            ],
                            [
                                "c6dch-iiaaa-aaaah-qacxq-cai",
                                {
                                    "name": "Dots",
                                    "playUrl": "https://2kvgp-zyaaa-aaaai-aappq-cai.raw.ic0.app/",
                                    "flavorText": [
                                        "Eehm... just snake? And a few dots here and there."
                                    ]
                                }
                            ]
                        ],
                        "withInterface": true
                    }
                }
            }
        }
    }
}