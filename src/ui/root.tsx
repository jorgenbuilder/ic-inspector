import React from 'react';
import {
    MessageEntry,
    MessageId,
    MessageRepository,
    MessageStatus,
} from '../services/logging';
import { Column, useGlobalFilter, useTable } from 'react-table';
import { DetailsPane } from './details';
import { increaseLogMax, LOG_MAX } from '../services/logging/common';

interface Row {
    message: string;
    name: string;
    canister: string;
    status: MessageStatus;
    type: string;
    timestamp: Date;
    duration?: number;
}

export function Root(props: {
    messages: MessageRepository;
    focusedMessage?: MessageEntry;
    capturing: boolean;
    handleClear: () => void;
    handleCaptureToggle: () => void;
    handleFocus: (message?: MessageId) => void;
}) {
    const {
        messages,
        focusedMessage,
        capturing,
        handleClear,
        handleCaptureToggle,
        handleFocus,
    } = props;

    const [filter, setfilter] = React.useState<string>('');
    const data = React.useMemo<Row[]>(
        () =>
            Object.entries(messages).map(([messageId, log]) => ({
                message: messageId,
                name: log.method.name,
                canister: log.canister.name || log.canister.identifier,
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
                    onClick={() => handleCaptureToggle()}
                    className={['record icon', capturing ? 'active' : ''].join(
                        ' ',
                    )}
                ></span>
                <span
                    onClick={() => handleClear()}
                    className="clear icon"
                ></span>
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
                                    <tr {...row.getRowProps()} style={focusedMessage?.meta.originalRequestId === row.original.message ? { backgroundColor: 'rgb(46 99 153)', color: 'white' } : {}}>
                                        {row.cells.map((cell, i) => {
                                            return (
                                                <td
                                                    onClick={() =>
                                                        handleFocus(
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
                                <td colSpan={6}>
                                    {Object.values(messages).length || 0}{' '}
                                    Messages {Object.values(messages).length >= LOG_MAX ? <>(max, trimming old messages <a style={{ cursor: 'pointer' }} onClick={increaseLogMax}>increase</a>)</> : ''}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {focusedMessage && (
                    <DetailsPane
                        message={focusedMessage}
                        clear={() => handleFocus()}
                    />
                )}
            </div>
        </div>
    );
}
