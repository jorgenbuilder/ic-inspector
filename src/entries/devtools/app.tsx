/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/jsx-key */
import React from 'react';
import ReactDOM from 'react-dom';
import { Column, useGlobalFilter, useTable } from 'react-table';
import { captureInternetComputerMessageFromNetworkEvent } from '../../services/capture';
import logRepository, {
    getMessageRequest,
    getMessageResponse,
    MessageEntry,
    MessageStatus,
} from '../../repositories/logs';
import { useStore } from 'zustand';
import { serialize } from '../../services/common';

(window as any).global = window;

interface Row {
    message: string;
    name: string;
    canister: string;
    status: MessageStatus;
    type: string;
    timestamp: Date;
    duration?: number;
}

function App() {
    const [capturing, setCapturing] = React.useState<boolean>(true);
    const [filter, setfilter] = React.useState<string>('');
    const {
        messages,
        log: newLog,
        focusedMessage,
        focus,
        clear,
    } = useStore(logRepository);

    const captureRequest = React.useMemo(() => {
        return (request: chrome.devtools.network.Request) => {
            captureInternetComputerMessageFromNetworkEvent(request).then(
                (r) => r && newLog(r.request, r.response),
            );
        };
    }, []);

    React.useEffect(() => console.log(focusedMessage), [focusedMessage]);

    React.useEffect(() => {
        if (capturing) {
            chrome.devtools.network.onRequestFinished.addListener(
                captureRequest,
            );
        } else {
            chrome.devtools.network.onRequestFinished.removeListener(
                captureRequest,
            );
        }
    }, [capturing]);

    const data = React.useMemo<Row[]>(
        () =>
            Object.entries(messages).map(([messageId, log]) => ({
                message: messageId,
                name: log.method.name,
                canister: log.canister.identifier,
                type: log.meta.type,
                status: log.meta.status,
                timestamp: log.timing.timestamp,
                duration: log.timing.durationMs,
            })),
        [messages],
    );

    const columns = React.useMemo<Column<Row>[]>(
        () => [
            {
                Header: 'Name',
                accessor: 'name',
                Cell: (x: { value: string }) => <>{x.value || '-'}</>,
            },
            {
                Header: 'Canister',
                accessor: 'canister',
            },
            {
                Header: 'Type',
                accessor: 'type',
                Cell: (x: { value: string }) => (
                    <>
                        {x.value === 'call'
                            ? 'update (call)'
                            : x.value == 'read_state'
                            ? 'update (read_state)'
                            : x.value}
                    </>
                ),
            },
            {
                Header: 'Status',
                accessor: 'status',
            },
            {
                Header: 'Timestamp',
                accessor: 'timestamp',
                Cell: (x: { value: Date }) => (
                    <>
                        {String(x.value.getHours() + 1).padStart(2, '0')}:
                        {String(x.value.getMinutes()).padStart(2, '0')}:
                        {String(x.value.getSeconds()).padStart(2, '0')}:
                        {String(x.value.getMilliseconds()).padStart(3, '0')}
                    </>
                ),
            },
            {
                Header: 'Duration',
                accessor: 'duration',
                Cell: (x: { value: number }) =>
                    x.value ? `${x.value}ms` : '-',
            },
        ],
        [],
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        // @ts-ignore
        setGlobalFilter,
    } = useTable(
        {
            columns,
            data,
            initialState: {
                // @ts-ignore
                globalFilter: filter,
            },
        },
        useGlobalFilter,
    );

    return (
        <div className="panel">
            <div className="controls">
                <span
                    onClick={() => setCapturing(!capturing)}
                    className={['record icon', capturing ? 'active' : ''].join(
                        ' ',
                    )}
                ></span>
                <span onClick={() => clear()} className="clear icon"></span>
                <input
                    type="text"
                    className="filter"
                    placeholder="Filter"
                    onChange={(e) => {
                        setfilter(e.currentTarget.value);
                        setGlobalFilter(e.currentTarget.value);
                    }}
                    value={filter}
                />
            </div>
            <div
                className={[
                    'panel-body',
                    focusedMessage ? 'side-by-side' : '',
                ].join(' ')}
            >
                <div className="table-container">
                    <table {...getTableProps()}>
                        <thead>
                            {headerGroups.map((headerGroup) => (
                                <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                        <th {...column.getHeaderProps()}>
                                            {column.render('Header')}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody {...getTableBodyProps()}>
                            {rows.map((row, j) => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()}>
                                        {row.cells.map((cell, i) => {
                                            return (
                                                <td
                                                    onClick={() =>
                                                        focus(
                                                            row.original
                                                                .message,
                                                        )
                                                    }
                                                    {...cell.getCellProps()}
                                                >
                                                    {cell.render('Cell')}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={6}>{messages.length} Messages</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {focusedMessage && (
                    <DetailsPane
                        message={focusedMessage}
                        clear={() => focus()}
                    />
                )}
            </div>
        </div>
    );
}

function DetailsPane(props: { message: MessageEntry; clear: () => void }) {
    const { message } = props;
    return (
        <div className="details-pane">
            <div className="details-pane__head">
                <div onClick={props.clear} className="close icon"></div>
            </div>
            <div className="details-pane__body">
                <strong>Canister</strong>
                <pre>{message.canister.identifier}</pre>
                <strong>Caller</strong>
                <pre>{message.caller.identifier.toText()}</pre>
                <strong>Method</strong>
                <pre>{message.method.name}</pre>
                <strong>Request</strong>
                <pre>
                    {JSON.stringify(
                        getMessageRequest(message).request,
                        serialize,
                        4,
                    )}
                </pre>
                <strong>Response</strong>
                <pre>
                    {JSON.stringify(
                        getMessageResponse(message)?.response,
                        serialize,
                        4,
                    )}
                </pre>
            </div>
        </div>
    );
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
