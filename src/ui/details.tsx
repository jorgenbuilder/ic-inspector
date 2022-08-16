import React from 'react';
import ReactJson from 'react-json-view';
import {
    getMessageReply,
    getMessageRequest,
    MessageEntry,
} from '../repositories/logs';
import { serialize } from '../services/common';
import Styles from './details.module.css';

export function DetailsPane(props: {
    message: MessageEntry;
    clear: () => void;
}) {
    const { message } = props;

    const tabs = React.useMemo(
        () =>
            [
                ['Overview', <Overview message={message} key="overview" />],
                ['Payload', <Payload message={message} key="payload" />],
                ['Response', <Response message={message} key="response" />],
            ] as [string, JSX.Element][],
        [message],
    );

    const [tab, setTab] = React.useState(tabs[0][0]);
    const active = React.useMemo(
        () => tabs.find(([title]) => title === tab)?.[1],
        [tab, message],
    );

    return (
        <div className={Styles.details}>
            <div className={Styles.detailsHead}>
                <div onClick={props.clear} className="close icon"></div>
                <div className={Styles.tabs}>
                    {tabs.map(([title]) => (
                        <div
                            className={[
                                Styles.tab,
                                tab === title ? Styles.active : '',
                            ].join(' ')}
                            key={title}
                            onClick={() => setTab(title)}
                        >
                            {title}
                        </div>
                    ))}
                </div>
            </div>
            <div className={Styles.detailsBody}>{active}</div>
        </div>
    );
}

function Overview(props: { message: MessageEntry }) {
    const { message } = props;

    return (
        <div>
            <Section title="Method">
                <dl>
                    <dt>Type</dt>
                    <dd>{message.method.query ? 'Query' : 'Update'}</dd>
                    <dt>Name</dt>
                    <dd>{message.method.name}</dd>
                    {/* <dt>Arg Types</dt>
                    <dd></dd>
                    <dt>Return Types</dt>
                    <dd></dd> */}
                </dl>
            </Section>
            <Section title="Canister">
                <dl>
                    <dt>Registered Name</dt>
                    <dd>
                        {message.canister.logoUrl && (
                            <img src={message.canister.logoUrl} />
                        )}
                        {message.canister.name || (
                            <span className={Styles.dabWarning}>
                                Not registered with DAB
                            </span>
                        )}
                    </dd>
                    <dt>Identifier</dt>
                    <dd>{message.canister.identifier}</dd>
                    <dt>Subnet</dt>
                    <dd>
                        <a
                            href={`https://dashboard.internetcomputer.org/subnet/{message.canister.subnet}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            https://dashboard.internetcomputer.org/subnet/
                            {message.canister.subnet}
                        </a>
                    </dd>
                    <dt>Description</dt>
                    <dd>
                        {message.canister.description || (
                            <span className={Styles.dabWarning}>
                                Not registered with DAB
                            </span>
                        )}
                    </dd>
                    <dt>Controllers</dt>
                    <dd>{message.canister.controllers.join(', ')}</dd>
                    <dt>Module Hash</dt>
                    <dd>{message.canister.moduleHash}</dd>
                </dl>
            </Section>
            <Section title="Caller">
                <dl>
                    <dt>Identifier</dt>
                    <dd>{message.caller.identifier}</dd>
                    <dt>Anonymous</dt>
                    <dd>{message.caller.isAnonymous ? 'Yes' : 'No'}</dd>
                </dl>
            </Section>
            <Section title="General">
                <dl>
                    <dt>Boundary</dt>
                    <dd>{message.meta.boundary.host}</dd>
                    <dt>Status</dt>
                    <dd>
                        {(function () {
                            switch (message.meta.status) {
                                case 'pending':
                                    return '🔵';
                                case 'replied':
                                    return '🟢';
                                case 'rejected':
                                    return '🔴';
                            }
                        })()}
                        {message.meta.status}
                    </dd>
                    <dt>Consensus</dt>
                    <dd>{message.meta.consensus}</dd>
                </dl>
            </Section>
        </div>
    );
}

function Payload(props: { message: MessageEntry }) {
    const { message } = props;

    const { result: payload, withInterface } = React.useMemo(
        () => getMessageRequest(message).args,
        [message],
    );

    return (
        <PrettyJson value={payload} candidWarning={withInterface === false} />
    );
}

function Response(props: { message: MessageEntry }) {
    const { message } = props;

    const reply = React.useMemo(() => {
        const reply = getMessageReply(message);
        if (!reply) {
            return {
                result: undefined,
                withInterface: undefined,
            };
        } else if ('result' in reply) {
            return reply;
        } else {
            return {
                result: reply,
                withInterface: undefined,
            };
        }
    }, [message]);
    return (
        <PrettyJson
            value={reply.result}
            candidWarning={reply.withInterface === false}
        />
    );
}

function Section(props: { children: React.ReactNode; title: string }) {
    const [open, setOpen] = React.useState(true);
    return (
        <div className={[Styles.section, open ? Styles.open : ''].join(' ')}>
            <div className={Styles.header} onClick={() => setOpen(!open)}>
                <div className={Styles.carat}>▴</div>
                <div className={Styles.title}>{props.title}</div>
            </div>
            <div className={Styles.body}>{props.children}</div>
        </div>
    );
}

function PrettyJson(props: { value: any; candidWarning: boolean }) {
    const { value, candidWarning } = props;
    return (
        <div>
            {candidWarning && (
                <div>
                    ⚠️ Could not determine candid interface for this canister,
                    so this is a partial decode.
                </div>
            )}
            {value && typeof value === 'object' ? (
                <ReactJson
                    style={{ backgroundColor: 'transparent' }}
                    theme="hopscotch"
                    src={serialize(value)}
                />
            ) : (
                <pre>{value || 'null'}</pre>
            )}
        </div>
    );
}