import React from 'react';
import ReactJson from 'react-json-view';
import {
    getMessageRequest,
    getMessageResponse,
    MessageEntry,
} from '../repositories/logs';
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
        [],
    );

    const [tab, setTab] = React.useState(tabs[0][0]);
    console.log(tab);

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
                            onClick={() => setTab(tab)}
                        >
                            {title}
                        </div>
                    ))}
                </div>
            </div>
            <div className={Styles.detailsBody}>
                {tabs.find(([title]) => title === tab)?.[1]}
            </div>
        </div>
    );
}

function Overview(props: { message: MessageEntry }) {
    const { message } = props;

    return (
        <div>
            <Section title="General">
                <dl>
                    <dt>Boundary</dt>
                    <dl>{message.meta.boundary.host}</dl>
                    <dt>Status</dt>
                    <dl>{message.meta.status}</dl>
                    <dt>Consensus</dt>
                    <dl>{message.meta.consensus}</dl>
                </dl>
            </Section>
            <Section title="Canister">
                <dl>
                    <dt>Registered Name</dt>
                    <dd>
                        {message.canister.logoUrl && (
                            <img src={message.canister.logoUrl} />
                        )}
                        {message.canister.name}
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
                    <dd>{message.canister.description}</dd>
                    <dt>Controllers</dt>
                    <dd>{message.canister.controllers.join(', ')}</dd>
                    <dt>Module Hash</dt>
                    <dd>{message.canister.moduleHash}</dd>
                </dl>
            </Section>
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
            <Section title="Caller">
                <dl>
                    <dt>Identifier</dt>
                    <dd>{message.caller.identifier.toText()}</dd>
                    <dt>Anonymous</dt>
                    <dd>{message.caller.isAnonymous ? 'Yes' : 'No'}</dd>
                </dl>
            </Section>
        </div>
    );
}

function Payload(props: { message: MessageEntry }) {
    const { message } = props;

    const request = React.useMemo(
        () => getMessageRequest(message).response,
        [message],
    );
    return (
        <div>
            <ReactJson
                style={{ backgroundColor: 'transparent' }}
                theme="hopscotch"
                src={request}
            />
        </div>
    );
}

function Response(props: { message: MessageEntry }) {
    const { message } = props;

    const response = React.useMemo(
        () => getMessageResponse(message)?.response,
        [message],
    );
    return (
        <div>
            <ReactJson
                style={{ backgroundColor: 'transparent' }}
                theme="hopscotch"
                src={response || {}}
            />
        </div>
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
