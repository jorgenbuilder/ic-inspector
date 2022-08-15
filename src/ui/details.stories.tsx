import React from 'react';
import { ComponentStory, ComponentMeta } from "@storybook/react"
import { DetailsPane } from "./details"
import { randomLog } from '../repositories/factories/logs';

export default {
    title: "Components/Details Pane",
    component: DetailsPane,
    parameters: {
      // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
      layout: "fullscreen",
    },
  } as ComponentMeta<typeof DetailsPane>

  const Template: ComponentStory<typeof DetailsPane> = (args) => {
    return (
      <DetailsPane {...args} />
    )
  }

export const WithEvent = Template.bind({})

WithEvent.args = {
    message: randomLog(),
    clear: () => null
}