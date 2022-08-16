import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Root } from './root';
import { useStore } from 'zustand';
import logRepository, { MessageId } from '../repositories/logs';
import { randomMessage } from '../repositories/stubs';

export default {
    title: 'Components/Root',
    component: Root,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
} as ComponentMeta<typeof Root>;

const Template: ComponentStory<typeof Root> = (args) => {
    const { focusedMessage, clear, focus, log, messages } =
        useStore(logRepository);
    const [capturing, setCapturing] = React.useState(true);

    React.useEffect(() => {
        for (let i = 5; i > 0; i--) {
            const message = randomMessage()
            Object.values(message.requests).forEach(({ request, response }) => log(request, response))
        }
    }, []);

    return (
        <Root
            messages={messages}
            focusedMessage={focusedMessage}
            capturing={capturing}
            handleCaptureToggle={() => setCapturing(!capturing)}
            handleClear={clear}
            handleFocus={(m: MessageId) => focus(m)}
        />
    );
};
export const Standard = Template.bind({});
