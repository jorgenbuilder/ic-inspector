export default "export const idlFactory = ({ IDL }) => {\
    const Player = IDL.Variant({\
        plug: IDL.Principal,\
        stoic: IDL.Principal,\
    });\
    const AuthenticationRequest = IDL.Variant({\
        authenticate: Player,\
        link: IDL.Tuple(Player, Player),\
    });\
    const AccountId = IDL.Nat;\
    const Account = IDL.Record({\
        id: AccountId,\
        alias: IDL.Opt(IDL.Text),\
        plugAddress: IDL.Opt(IDL.Principal),\
        stoicAddress: IDL.Opt(IDL.Principal),\
        primaryWallet: Player,\
        flavorText: IDL.Opt(IDL.Text),\
        avatar: IDL.Opt(IDL.Text),\
    });\
    const AuthenticationResponse = IDL.Variant({\
        ok: IDL.Record({ message: IDL.Text, account: Account }),\
        err: IDL.Record({ message: IDL.Text }),\
        forbidden: IDL.Null,\
        pendingConfirmation: IDL.Record({ message: IDL.Text }),\
    });\
    const GamePrincipal = IDL.Principal;\
    const Score__1 = IDL.Tuple(AccountId, IDL.Nat);\
    const Result_2 = IDL.Variant({ ok: Account, err: IDL.Null });\
    const AccountDetails = IDL.Record({\
        id: AccountId,\
        alias: IDL.Opt(IDL.Text),\
        flavorText: IDL.Opt(IDL.Text),\
        avatar: IDL.Opt(IDL.Text),\
    });\
    const Result_1 = IDL.Variant({ ok: AccountDetails, err: IDL.Null });\
    const DetailedScore = IDL.Tuple(AccountDetails, IDL.Nat);\
    const Metadata = IDL.Record({\
        name: IDL.Text,\
        playUrl: IDL.Text,\
        flavorText: IDL.Opt(IDL.Text),\
    });\
    const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);\
    const HttpRequest = IDL.Record({\
        url: IDL.Text,\
        method: IDL.Text,\
        body: IDL.Vec(IDL.Nat8),\
        headers: IDL.Vec(HeaderField),\
    });\
    const StreamingCallbackToken = IDL.Record({\
        key: IDL.Text,\
        sha256: IDL.Opt(IDL.Vec(IDL.Nat8)),\
        index: IDL.Nat,\
        content_encoding: IDL.Text,\
    });\
    const StreamingCallbackHttpResponse = IDL.Record({\
        token: IDL.Opt(StreamingCallbackToken),\
        body: IDL.Vec(IDL.Nat8),\
    });\
    const StreamingStrategy = IDL.Variant({\
        Callback: IDL.Record({\
            token: StreamingCallbackToken,\
            callback: IDL.Func(\
                [StreamingCallbackToken],\
                [StreamingCallbackHttpResponse],\
                ['query'],\
            ),\
        }),\
    });\
    const HttpResponse = IDL.Record({\
        body: IDL.Vec(IDL.Nat8),\
        headers: IDL.Vec(HeaderField),\
        streaming_strategy: IDL.Opt(StreamingStrategy),\
        status_code: IDL.Nat16,\
    });\
    const Score = IDL.Tuple(Player, IDL.Nat);\
    const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });\
    const UpdateRequest = IDL.Record({\
        alias: IDL.Opt(IDL.Text),\
        primaryWallet: IDL.Opt(Player),\
        flavorText: IDL.Opt(IDL.Text),\
        avatar: IDL.Opt(IDL.Text),\
    });\
    const UpdateResponse = IDL.Variant({ ok: Account, err: IDL.Text });\
    return IDL.Service({\
        addAdmin: IDL.Func([IDL.Principal], [], []),\
        authenticateAccount: IDL.Func(\
            [AuthenticationRequest],\
            [AuthenticationResponse],\
            [],\
        ),\
        calculateMetascores: IDL.Func([GamePrincipal, IDL.Nat], [], []),\
        cron: IDL.Func([], [], []),\
        drainScoreUpdateLog: IDL.Func(\
            [],\
            [IDL.Vec(IDL.Tuple(GamePrincipal, Score__1))],\
            ['query'],\
        ),\
        getAccount: IDL.Func([AccountId], [Result_2], ['query']),\
        getAccountDetails: IDL.Func([AccountId], [Result_1], ['query']),\
        getAccounts: IDL.Func([], [IDL.Vec(Account)], ['query']),\
        getDetailedGameScores: IDL.Func(\
            [GamePrincipal, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],\
            [IDL.Vec(DetailedScore)],\
            ['query'],\
        ),\
        getDetailedMetascores: IDL.Func(\
            [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],\
            [IDL.Vec(DetailedScore)],\
            ['query'],\
        ),\
        getGameScores: IDL.Func(\
            [GamePrincipal, IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],\
            [IDL.Vec(Score__1)],\
            ['query'],\
        ),\
        getGames: IDL.Func(\
            [],\
            [IDL.Vec(IDL.Tuple(GamePrincipal, Metadata))],\
            ['query'],\
        ),\
        getMetascore: IDL.Func(\
            [GamePrincipal, AccountId],\
            [IDL.Nat],\
            ['query'],\
        ),\
        getMetascores: IDL.Func(\
            [IDL.Opt(IDL.Nat), IDL.Opt(IDL.Nat)],\
            [IDL.Vec(Score__1)],\
            ['query'],\
        ),\
        getOverallMetascore: IDL.Func([AccountId], [IDL.Nat], ['query']),\
        getPercentile: IDL.Func([AccountId], [IDL.Opt(IDL.Float64)], ['query']),\
        getPercentileMetascore: IDL.Func([IDL.Float64], [IDL.Nat], ['query']),\
        getPlayerCount: IDL.Func([], [IDL.Nat], ['query']),\
        getRanking: IDL.Func(\
            [GamePrincipal, AccountId],\
            [IDL.Opt(IDL.Nat)],\
            ['query'],\
        ),\
        getScoreCount: IDL.Func([], [IDL.Nat], ['query']),\
        getTop: IDL.Func([IDL.Nat], [IDL.Vec(Score__1)], ['query']),\
        http_request: IDL.Func([HttpRequest], [HttpResponse], ['query']),\
        isAdmin: IDL.Func([IDL.Principal], [IDL.Bool], ['query']),\
        loadAccountScores: IDL.Func([GamePrincipal, IDL.Vec(Score__1)], [], []),\
        loadAccounts: IDL.Func([IDL.Vec(Account)], [], []),\
        loadGameScores: IDL.Func([GamePrincipal, IDL.Vec(Score)], [], []),\
        loadGames: IDL.Func(\
            [IDL.Vec(IDL.Tuple(GamePrincipal, Metadata))],\
            [],\
            [],\
        ),\
        queryGameScores: IDL.Func([GamePrincipal], [], []),\
        register: IDL.Func([GamePrincipal], [Result], []),\
        registerGame: IDL.Func([Metadata], [], []),\
        removeAdmin: IDL.Func([IDL.Principal], [], []),\
        scoreUpdate: IDL.Func([IDL.Vec(Score)], [], []),\
        unregister: IDL.Func([GamePrincipal], [], []),\
        updateAccount: IDL.Func([UpdateRequest], [UpdateResponse], []),\
    });\
};\
export const init = ({ IDL }) => {\
    return [];\
};";
