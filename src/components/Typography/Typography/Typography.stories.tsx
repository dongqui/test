import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _Typography from './';

export default {
  component: _Typography,
  // TODO: add argTypes if any
  argTypes: {},
} as ComponentMeta<typeof _Typography>;

const Template: ComponentStory<typeof _Typography> = (args) => {
  return (
    <Fragment>
      <_Typography component="h1" variant="title">
        Typography
      </_Typography>
      <div style={{ zoom: 2 }}>
        {typeof args.children === 'string' ? args.children.split('\n').map((v) => <_Typography {...args}>{v}</_Typography>) : <_Typography {...args} />}
      </div>
    </Fragment>
  );
};
export const Typography = Template.bind({});

// TODO: add default props
Typography.args = {
  br: false,
  children: 'This is test typography',
  component: 'div',
  variant: 'title',
};
