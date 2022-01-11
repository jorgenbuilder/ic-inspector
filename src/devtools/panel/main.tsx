/* eslint-disable react/jsx-key */
import React from 'react'
import ReactDOM from 'react-dom'
import { useTable } from 'react-table';
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
        payload: { [key: string]: any };
    }

    // Transform log into a react-table compatible structure
    const data = React.useMemo<Row[]>(
        () => log.map(event => ({
            canister: (event.url.match(/\/canister\/(.+)\//) as string[])[1],
            method: event.request.value.content.method_name,
            type: event.request.value.content.request_type.toUpperCase(),
            payload: event.response,
        })),
        [log]
    );

    const columns = React.useMemo<{ Header: string; accessor: string; }[]>(
        () => [
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
                Cell: function PayloadCell (x : { value : { [key: string]: any }}) {
                    return <>
                        <pre>{JSON.stringify(x.value, undefined, 2)}</pre>
                    </>
                }
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
    } = useTable(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { columns, data }
    )

    return <>
        <table {...getTableProps()}>
            <thead>
                {// Loop over the header rows
                    headerGroups.map(headerGroup => (
                        // Apply the header row props
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {// Loop over the headers in each row
                                headerGroup.headers.map(column => (
                                    // Apply the header cell props
                                    <th {...column.getHeaderProps()}>
                                        {// Render the header
                                            column.render('Header')}
                                    </th>
                                ))}
                        </tr>
                    ))}
            </thead>
            {/* Apply the table body props */}
            <tbody {...getTableBodyProps()}>
                {// Loop over the table rows
                    rows.map(row => {
                        // Prepare the row for display
                        prepareRow(row)
                        return (
                            // Apply the row props
                            <tr {...row.getRowProps()}>
                                {// Loop over the rows cells
                                    row.cells.map(cell => {
                                        // Apply the cell props
                                        return (
                                            <td {...cell.getCellProps()}>
                                                {// Render the cell contents
                                                    cell.render('Cell')}
                                            </td>
                                        )
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