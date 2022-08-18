export default "export const idlFactory = ({ IDL }) => {\
    const ProjectId = IDL.Nat32;\
    const MigrationRequest = IDL.Variant({\
        getMigrationClients: IDL.Nat,\
        getProjectClient: IDL.Tuple(IDL.Principal, ProjectId),\
        forgetMigrationClients: IDL.Tuple(ProjectId, IDL.Vec(IDL.Principal)),\
        forgetProjectClient: IDL.Tuple(IDL.Principal, ProjectId),\
    });\
    const ClientId = IDL.Nat32;\
    const SdkVersion = IDL.Nat32;\
    const AccessToken = IDL.Text;\
    const AnalyticsReceiverApiError = IDL.Variant({\
        invalidClient: IDL.Null,\
        wrongAccessToken: IDL.Null,\
        temporarilyUnavailable: IDL.Null,\
    });\
    const IsCollectRequiredResult = IDL.Variant({\
        ok: IDL.Bool,\
        err: AnalyticsReceiverApiError,\
    });\
    const IsCollectRequired = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],\
        [IsCollectRequiredResult],\
        ['query'],\
    );\
    const Event = IDL.Record({\
        name: IDL.Text,\
        sequence: IDL.Int,\
        timeMillis: IDL.Int,\
    });\
    const Session = IDL.Record({ sequence: IDL.Int, timeMillis: IDL.Int });\
    const PacketItem = IDL.Variant({ event: Event, session: Session });\
    const Packet = IDL.Record({ items: IDL.Vec(PacketItem) });\
    const PacketRejectedItem = IDL.Record({ sequence: IDL.Int });\
    const ValidatePacketResultOk = IDL.Record({\
        rejectedItems: IDL.Opt(IDL.Vec(PacketRejectedItem)),\
    });\
    const ValidatePacketResultError = IDL.Variant({\
        api: AnalyticsReceiverApiError,\
    });\
    const ValidatePacketResult = IDL.Variant({\
        ok: ValidatePacketResultOk,\
        err: ValidatePacketResultError,\
    });\
    const ValidatePacket = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet],\
        [ValidatePacketResult],\
        ['query'],\
    );\
    const CollectPacketResultOk = IDL.Record({});\
    const CollectPacketResultError = IDL.Variant({\
        api: AnalyticsReceiverApiError,\
    });\
    const CollectPacketResult = IDL.Variant({\
        ok: CollectPacketResultOk,\
        err: CollectPacketResultError,\
    });\
    const CollectPacket = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken, Packet],\
        [CollectPacketResult],\
        [],\
    );\
    const CollectResult = IDL.Variant({\
        ok: IDL.Null,\
        err: AnalyticsReceiverApiError,\
    });\
    const Collect = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],\
        [CollectResult],\
        [],\
    );\
    const AnalyticsReceiverApi = IDL.Record({\
        isCollectRequired: IsCollectRequired,\
        validatePacket: ValidatePacket,\
        collectPacket: CollectPacket,\
        collect: Collect,\
    });\
    const GetAnalyticsReceiverApiResult = IDL.Variant({\
        ok: AnalyticsReceiverApi,\
        err: AnalyticsReceiverApiError,\
    });\
    const GetAnalyticsReceiverApi = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, AccessToken],\
        [GetAnalyticsReceiverApiResult],\
        ['query'],\
    );\
    const ProjectClient = IDL.Record({\
        clientId: ClientId,\
        getAnalyticsReceiverApi: GetAnalyticsReceiverApi,\
    });\
    const MigrationResponse = IDL.Variant({\
        forgetMigrationClientsResult: IDL.Null,\
        error: IDL.Null,\
        getMigrationClientsResult: IDL.Opt(\
            IDL.Tuple(\
                ProjectId,\
                ClientId,\
                IDL.Vec(IDL.Tuple(IDL.Principal, ProjectClient)),\
            ),\
        ),\
        getProjectClientResult: ProjectClient,\
        getProjectClientResultNotFound: ClientId,\
        forgetProjectClientResult: IDL.Null,\
    });\
    const MigrationSupplier = IDL.Service({\
        migration: IDL.Func(\
            [IDL.Nat, MigrationRequest],\
            [MigrationResponse],\
            [],\
        ),\
    });\
    const PartitionRole = IDL.Variant({\
        active: IDL.Null,\
        unsupport: IDL.Null,\
        migratingFrom: IDL.Principal,\
        migratingTo: MigrationSupplier,\
    });\
    const RegisterNewClientResult = IDL.Variant({\
        ok: IDL.Null,\
        err: AnalyticsReceiverApiError,\
    });\
    const RegisterNewClient = IDL.Func(\
        [AccessToken],\
        [RegisterNewClientResult],\
        [],\
    );\
    const AnalyticsReceiverFactory = IDL.Record({\
        getAnalyticsReceiverApi: GetAnalyticsReceiverApi,\
        registerNewClient: RegisterNewClient,\
    });\
    const ClientRegistryConfigurationRequest = IDL.Variant({\
        setPartitionRole: IDL.Tuple(IDL.Nat, PartitionRole),\
        setAnalyticsReceiverFactories: IDL.Tuple(\
            IDL.Vec(AnalyticsReceiverFactory),\
            IDL.Vec(IDL.Text),\
        ),\
    });\
    const Result = IDL.Variant({ ok: IDL.Null, err: IDL.Text });\
    const ProjectApiKey = IDL.Text;\
    const AnalyticsReceiver = IDL.Record({\
        getAnalyticsReceiverApi: GetAnalyticsReceiverApi,\
        accessToken: AccessToken,\
    });\
    const GetAnalyticsReceiverError = IDL.Variant({\
        wrongApiKey: IDL.Null,\
        clientBlocked: IDL.Null,\
        invalidClient: IDL.Null,\
        clientNotRegistered: IDL.Null,\
        temporarilyUnavailable: IDL.Null,\
        wrongTopology: IDL.Null,\
    });\
    const GetAnalyticsReceiverResult = IDL.Variant({\
        ok: AnalyticsReceiver,\
        err: GetAnalyticsReceiverError,\
    });\
    const GetLogMessagesFilter = IDL.Record({\
        analyzeCount: IDL.Nat32,\
        messageRegex: IDL.Opt(IDL.Text),\
        messageContains: IDL.Opt(IDL.Text),\
    });\
    const Nanos = IDL.Nat64;\
    const GetLogMessagesParameters = IDL.Record({\
        count: IDL.Nat32,\
        filter: IDL.Opt(GetLogMessagesFilter),\
        fromTimeNanos: IDL.Opt(Nanos),\
    });\
    const GetLatestLogMessagesParameters = IDL.Record({\
        upToTimeNanos: IDL.Opt(Nanos),\
        count: IDL.Nat32,\
        filter: IDL.Opt(GetLogMessagesFilter),\
    });\
    const CanisterLogRequest = IDL.Variant({\
        getMessagesInfo: IDL.Null,\
        getMessages: GetLogMessagesParameters,\
        getLatestMessages: GetLatestLogMessagesParameters,\
    });\
    const CanisterLogFeature = IDL.Variant({\
        filterMessageByContains: IDL.Null,\
        filterMessageByRegex: IDL.Null,\
    });\
    const CanisterLogMessagesInfo = IDL.Record({\
        features: IDL.Vec(IDL.Opt(CanisterLogFeature)),\
        lastTimeNanos: IDL.Opt(Nanos),\
        count: IDL.Nat32,\
        firstTimeNanos: IDL.Opt(Nanos),\
    });\
    const LogMessagesData = IDL.Record({\
        timeNanos: Nanos,\
        message: IDL.Text,\
    });\
    const CanisterLogMessages = IDL.Record({\
        data: IDL.Vec(LogMessagesData),\
        lastAnalyzedMessageTimeNanos: IDL.Opt(Nanos),\
    });\
    const CanisterLogResponse = IDL.Variant({\
        messagesInfo: CanisterLogMessagesInfo,\
        messages: CanisterLogMessages,\
    });\
    const MetricsGranularity = IDL.Variant({\
        hourly: IDL.Null,\
        daily: IDL.Null,\
    });\
    const GetMetricsParameters = IDL.Record({\
        dateToMillis: IDL.Nat,\
        granularity: MetricsGranularity,\
        dateFromMillis: IDL.Nat,\
    });\
    const UpdateCallsAggregatedData = IDL.Vec(IDL.Nat64);\
    const CanisterHeapMemoryAggregatedData = IDL.Vec(IDL.Nat64);\
    const CanisterCyclesAggregatedData = IDL.Vec(IDL.Nat64);\
    const CanisterMemoryAggregatedData = IDL.Vec(IDL.Nat64);\
    const HourlyMetricsData = IDL.Record({\
        updateCalls: UpdateCallsAggregatedData,\
        canisterHeapMemorySize: CanisterHeapMemoryAggregatedData,\
        canisterCycles: CanisterCyclesAggregatedData,\
        canisterMemorySize: CanisterMemoryAggregatedData,\
        timeMillis: IDL.Int,\
    });\
    const NumericEntity = IDL.Record({\
        avg: IDL.Nat64,\
        max: IDL.Nat64,\
        min: IDL.Nat64,\
        first: IDL.Nat64,\
        last: IDL.Nat64,\
    });\
    const DailyMetricsData = IDL.Record({\
        updateCalls: IDL.Nat64,\
        canisterHeapMemorySize: NumericEntity,\
        canisterCycles: NumericEntity,\
        canisterMemorySize: NumericEntity,\
        timeMillis: IDL.Int,\
    });\
    const CanisterMetricsData = IDL.Variant({\
        hourly: IDL.Vec(HourlyMetricsData),\
        daily: IDL.Vec(DailyMetricsData),\
    });\
    const CanisterMetrics = IDL.Record({ data: CanisterMetricsData });\
    const GetAnalyticsReceiver = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],\
        [GetAnalyticsReceiverResult],\
        ['query'],\
    );\
    const RegisterClientOkResult = IDL.Record({\
        analyticsReceiver: AnalyticsReceiver,\
        analyticsStoreNotified: IDL.Bool,\
    });\
    const RegisterClientError = IDL.Variant({\
        wrongApiKey: IDL.Null,\
        invalidClient: IDL.Null,\
        temporarilyUnavailable: IDL.Null,\
        wrongTopology: IDL.Null,\
    });\
    const RegisterClientResult = IDL.Variant({\
        ok: RegisterClientOkResult,\
        err: RegisterClientError,\
    });\
    const RegisterClient = IDL.Func(\
        [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],\
        [RegisterClientResult],\
        [],\
    );\
    const ClientRegistry = IDL.Record({\
        getAnalyticsReceiver: GetAnalyticsReceiver,\
        registerClient: RegisterClient,\
    });\
    const MetricValue = IDL.Variant({ count: IDL.Int, gauge: IDL.Nat });\
    const MetricLabel = IDL.Record({ value: IDL.Text, name: IDL.Text });\
    const MetricData = IDL.Record({\
        metricValue: MetricValue,\
        labels: IDL.Opt(IDL.Vec(MetricLabel)),\
    });\
    const MetricType = IDL.Variant({ counter: IDL.Null, gauge: IDL.Null });\
    const MetricsData = IDL.Record({\
        data: IDL.Vec(MetricData),\
        help: IDL.Text,\
        name: IDL.Text,\
        metricType: MetricType,\
    });\
    return IDL.Service({\
        collectCanisterMetrics: IDL.Func([], [], []),\
        configure: IDL.Func(\
            [IDL.Vec(ClientRegistryConfigurationRequest)],\
            [Result],\
            [],\
        ),\
        getAnalyticsReceiver: IDL.Func(\
            [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],\
            [GetAnalyticsReceiverResult],\
            ['query'],\
        ),\
        getCanisterLog: IDL.Func(\
            [IDL.Opt(CanisterLogRequest)],\
            [IDL.Opt(CanisterLogResponse)],\
            ['query'],\
        ),\
        getCanisterMetrics: IDL.Func(\
            [GetMetricsParameters],\
            [IDL.Opt(CanisterMetrics)],\
            ['query'],\
        ),\
        getClientRegistry: IDL.Func([], [ClientRegistry], []),\
        getInformation: IDL.Func([], [IDL.Text], []),\
        getMGTInformation: IDL.Func([], [IDL.Text], []),\
        metrics: IDL.Func([IDL.Text], [IDL.Vec(MetricsData)], []),\
        migrateClients: IDL.Func([IDL.Nat, IDL.Nat], [IDL.Nat], []),\
        migration: IDL.Func(\
            [IDL.Nat, MigrationRequest],\
            [MigrationResponse],\
            [],\
        ),\
        registerClient: IDL.Func(\
            [IDL.Opt(IDL.Principal), SdkVersion, ProjectApiKey],\
            [RegisterClientResult],\
            [],\
        ),\
    });\
};\
export const init = ({ IDL }) => {\
    return [];\
};"