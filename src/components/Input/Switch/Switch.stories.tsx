import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _Switch from './';

import classNames from 'classnames/bind';
import styles from './Switch.stories.module.scss';

const cx = classNames.bind(styles);

export default {
  component: _Switch,
  // TODO: add argTypes if any
  argTypes: {
    onChange: {
      control: false,
    },
    className: {
      control: false,
    },
  },
} as ComponentMeta<typeof _Switch>;

const Template: ComponentStory<typeof _Switch> = (args) => {
  return (
    <Fragment>
      <div>
        <h2>sample switch</h2>
        <_Switch {...args} className={cx('switch-story')} />
      </div>
      <br />
      <div>
        <h2>sample form</h2>
      </div>
    </Fragment>
  );
};
export const Switch = Template.bind({});

// TODO: add default props
Switch.args = {
  options: [
    {
      key: 'opt1',
      label: 'single',
      value: 0,
    },
    {
      key: 'opt2',
      label: 'multi',
      value: 1,
    },
  ],
  type: 'primary',
  disabled: false,
  fullSize: false,
  defaultKey: 'opt2',
  onChange: (key) => console.log(key),
};
