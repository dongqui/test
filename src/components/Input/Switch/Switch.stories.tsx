import { Fragment } from 'react';
import { Controller } from 'react-hook-form';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { BaseForm } from 'components/Form';
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
  const handleSubmit = (data: any) => {
    console.log(data);
  };
  const fieldArgs = {
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
    onChange: (key: string) => console.log(key),
  };

  return (
    <Fragment>
      <div>
        <h2>sample switch</h2>
        <_Switch {...args} className={cx('switch-story')} />
      </div>
      <br />
      <div>
        <h2>sample form</h2>
        <BaseForm onSubmit={handleSubmit}>
          {(props) => (
            <Fragment>
              <Controller
                defaultValue={'opt2'}
                control={props.control}
                name="switch"
                render={({ field }) => <_Switch {...args} className={cx('switch-story')} onChange={field.onChange} />}
              />
              {/*<BaseField<Field.SwitchProps>*/}
              {/*  render={({ onChange, ...rest }) => <_Switch {...args} defaultKey={rest.defaultValue} className={cx('switch-story')} onChange={onChange} />}*/}
              {/*  control={props.control}*/}
              {/*  name="form-switch"*/}
              {/*  defaultValue="opt2"*/}
              {/*/>*/}
              <button type="submit">Submit</button>
            </Fragment>
          )}
        </BaseForm>
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
