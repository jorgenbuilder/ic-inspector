/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/jsx-key */
import React from 'react'
import ReactDOM from 'react-dom'
import { useTable, useExpanded } from 'react-table';
import capture, { LogEvent } from './capture';

(window as any).global = window;

function App() {
    const [log, setLog] = React.useState<LogEvent[]>([]);

    React.useEffect(() => {
        // Start capturing network events.
        // TODO: Would be great to start capture earlier.
        chrome.devtools.network.onRequestFinished.addListener((request) => {
            capture(
                request,
                [],
                (event) => {
                    setLog(prev => [...prev, event]);
                }
            );
        });
    }, []);

    interface Row {
        canister: string;
        method: string;
        type: string;
        subRows: any[];
    }

    // Transform log into a react-table compatible structure
    const data = React.useMemo<Row[]>(
        () => log.map(event => ({
            timestamp: event.time,
            canister: (event.url.match(/\/canister\/(.+)\//) as string[])[1],
            method: event.request.value.content.method_name,
            type: event.request.value.content.request_type.toUpperCase(),
            subRows: [
                {
                    payload: event.response
                }
            ],
        })),
        [log]
    );

    const columns = React.useMemo(
        () => [
            {
                // Build our expander column
                id: 'expander', // Make sure it has an ID
                // @ts-ignore
                // eslint-disable-next-line react/prop-types
                Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                    <span {...getToggleAllRowsExpandedProps()}>
                        {/* {isAllRowsExpanded ? '▼' : '▶'} */}
                    </span>
                ),
                // @ts-ignore
                // eslint-disable-next-line react/prop-types
                Cell: ({ row }) =>
                    // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
                    // to build the toggle for expanding a row
                    // eslint-disable-next-line react/prop-types
                    row.canExpand ? (
                        <span
                            // eslint-disable-next-line react/prop-types
                            {...row.getToggleRowExpandedProps()}
                        >
                            {/* eslint-disable-next-line react/prop-types */}
                            {row.isExpanded ? '▼' : '▶'}
                        </span>
                    ) : null,
            },
            {
                id: 'main',
                Header: () => <></>,
                columns: [
                    {
                        Header: 'Timestamp',
                        accessor: 'timestamp',
                        Cell: (x: {value: Date}) => <>{x.value ? x.value.toLocaleTimeString() : ''}</>
                    },
                    {
                        Header: 'Canister',
                        accessor: 'canister',
                    },
                    {
                        Header: 'Method',
                        accessor: 'method',
                    },
                    {
                        Header: 'Type',
                        accessor: 'type',
                    },
                    {
                        Header: 'Payload',
                        accessor: 'payload',
                        Cell: function PayloadCell(x: { value: { [key: string]: any } }) {
                            return <>
                                <pre>{JSON.stringify(x.value, undefined, 2)}</pre>
                            </>
                        }
                    },
                ],
            },
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
        // @ts-ignore
        state: { expanded },
    } = useTable(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { columns, data },
        useExpanded
    )

    return <>
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                    )
                })}
            </tbody>
        </table>
    </>
}

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root')
);