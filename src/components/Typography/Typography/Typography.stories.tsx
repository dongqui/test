import { ComponentMeta, ComponentStory } from '@storybook/react';
import { default as Tg } from './';

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
  },
} as ComponentMeta<typeof Tg>;

const Template: ComponentStory<typeof Tg> = (args) => {
  return (
    <div className={cx('typo-story')}>
      <Tg>default(body)</Tg>
      <Tg>한글의 경우 Noto Sans로 표현됩니다.</Tg>
      <div>
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
  );
};
export const Typography = Template.bind({});

// TODO: add default props
Typography.args = {
  children: 'This is test typography.',
  type: 'title',
};
