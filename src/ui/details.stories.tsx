import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { DetailsPane } from './details';
import { randomMessage } from '../stubs';

export default {
    title: 'Components/Details Pane',
    component: DetailsPane,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
} as ComponentMeta<typeof DetailsPane>;

const Template: ComponentStory<typeof DetailsPane> = () => {
    const message = randomMessage()
    console.log(message)
    return <DetailsPane clear={() => null} message={message} />;
};

export const Standard = Template.bind({});