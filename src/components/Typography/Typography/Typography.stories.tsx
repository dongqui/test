import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Typography as Tg } from '../';

import classNames from 'classnames/bind';
import styles from './Typography.stories.module.scss';

const cx = classNames.bind(styles);

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
    <div className={cx('typo-story')}>
      <div>
        <Tg variant="title">simple usage</Tg>
        <Tg>default</Tg>
        <Tg variant="title">variant</Tg>
        <Tg component="span" br>
          break line
        </Tg>
        <Tg component="span">component</Tg>
      </div>
      <div>
        <Tg component="h1" variant="title">
          typography string children test
        </Tg>
        <div style={{ zoom: 1 }}>
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
      </div>
    </div>
  );
};
export const Typography = Template.bind({});

// TODO: add default props
Typography.args = {
  br: false,
  children: 'This is test typography.',
  component: 'div',
  variant: 'title',
};
