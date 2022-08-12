/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/jsx-key */
import React from 'react';
import ReactDOM from 'react-dom';
import { Column, useGlobalFilter, useTable } from 'react-table';
import capture, { LogEvent } from '../services/capture';
import { captureInternetComputerMessageFromNetworkEvent } from '../services/capture-new';

(window as any).global = window;

interface Row {
    i: number;
    timestamp: Date;
    canister: string;
    method: string;
    type: string;
    request: {};
    url: string;
}

function App() {
    const [log, setLog] = React.useState<LogEvent[]>([]);
    const [capturing, setCapturing] = React.useState<boolean>(true);
    const [focusLog, setFocusLog] = React.useState<LogEvent>();
    const [filter, setfilter] = React.useState<string>('');

    const captureRequest = React.useMemo(() => {
        return (request: chrome.devtools.network.Request) => {
            captureInternetComputerMessageFromNetworkEvent(request);
            capture(request, [], (event) => {
                setLog((prev) => [...prev, event]);
            });
        };
    }, []);

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

    // Transform log into a react-table compatible structure
    const data = React.useMemo<Row[]>(
        () =>
            log.map((event, i) => ({
                i,
                timestamp: event.time,
                canister: event.decoded.request.canister,
                // @ts-ignore
                method: event.decoded.request?.method,
                type: event.decoded.request.type,
                request: event.decoded.request,
                response: event.decoded.response,
                url: event.raw.url,
            })),
        [log],
    );

    const columns = React.useMemo<Column<Row>[]>(
        () => [
            {
                Header: 'Name',
                accessor: 'method',
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
                <span onClick={() => setLog([])} className="clear icon"></span>
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
                className={['panel-body', focusLog ? 'side-by-side' : ''].join(
                    ' ',
                )}
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
                                                    onClick={
                                                        i === 0
                                                            ? () =>
                                                                  setFocusLog(
                                                                      log[
                                                                          row
                                                                              .index
                                                                      ],
                                                                  )
                                                            : undefined
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
                                <td colSpan={6}>{log.length} Events</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {focusLog && (
                    <DetailsPane
                        event={focusLog}
                        clear={() => setFocusLog(undefined)}
                    />
                )}
            </div>
        </div>
    );
}

function DetailsPane(props: { event: LogEvent; clear: () => void }) {
    return (
        <div className="details-pane">
            <div className="details-pane__head">
                <div onClick={props.clear} className="close icon"></div>
            </div>
            <div className="details-pane__body">
                <strong>Canister</strong>
                <pre>{props.event.decoded.request.canister}</pre>
                <strong>Caller</strong>
                <pre>{props.event.decoded.request.caller}</pre>
                <strong>Method</strong>
                <pre>
                    {
                        // @ts-ignore
                        props.event.decoded.request?.method
                    }
                </pre>
                <strong>Request</strong>
                <pre>
                    {JSON.stringify(props.event.decoded.request, undefined, 4)}
                </pre>
                <strong>Response</strong>
                <pre>
                    {JSON.stringify(props.event.decoded.response, undefined, 4)}
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
