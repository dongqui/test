import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import { Typography as Tg } from '../';

export default {
  component: Tg,
  // TODO: add argTypes if any
  argTypes: {
    className: {
      control: false,
    },
    variantMapping: {
      control: false,
    },
  },
} as ComponentMeta<typeof Tg>;

const Template: ComponentStory<typeof Tg> = (args) => {
  return (
    <Fragment>
      <Tg component="h1" variant="title" className="typography">
        Typography
      </Tg>
      <div style={{ zoom: 2 }}>
        {typeof args.children === 'string' ? (
          args.children.split('\n').map((v, i) => (
            <Tg key={i} {...args}>
              {v}
            </Tg>
          ))
        ) : (
          <Tg {...args} />
        )}
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
  className: 'typography',
};
