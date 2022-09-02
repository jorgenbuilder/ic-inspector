import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Root } from './root';
import { useStore } from 'zustand';
import { logstore, MessageId } from '../services/logging';
import { RequestEntry, RequestRepository } from '../services/logging/requests';
import { randomMessage } from '../stubs/messages';

export default {
    title: 'Components/Root',
    component: Root,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
} as ComponentMeta<typeof Root>;

function timeIterateMessageRequests(
    requests: RequestRepository,
    callback: (request: RequestEntry) => void,
) {
    async function iterate(values: RequestEntry[]) {
        const request = values.shift();
        if (request) {
            callback(request);
            await new Promise((res) => setTimeout(res, Math.random() * 3000));
            values.length && iterate(values);
        }
    }
    iterate(
        Object.values(requests).sort((a, b) =>
            a.request.requestType === 'call'
                ? -1
                : a.timing.timestamp.getTime() - b.timing.timestamp.getTime(),
        ),
    );
}

const Template: ComponentStory<typeof Root> = (args) => {
    const { focusedMessage, clear, focus, log, messages } = useStore(logstore);
    const [capturing, setCapturing] = React.useState(true);

    React.useEffect(() => {
        for (let i = 5; i > 0; i--) {
            const message = randomMessage();
            timeIterateMessageRequests(
                message.requests,
                ({ request, response }) => log(request, response),
            );
        }
    }, []);

    return (
        <div>
            <Root
                messages={messages}
                focusedMessage={focusedMessage}
                capturing={capturing}
                handleCaptureToggle={() => setCapturing(!capturing)}
                handleClear={clear}
                handleFocus={(m?: MessageId) => focus(m)}
            />
            <button
                style={{ position: 'fixed', bottom: 38, left: 10 }}
                onClick={() => {
                    const message = randomMessage();
                    console.log('logging', message.method.name, message);
                    Object.values(message.requests).forEach(
                        ({ request, response }) => log(request, response),
                    );
                }}
            >
                Random Log
            </button>
        </div>
    );
};
export const Standard = Template.bind({});
