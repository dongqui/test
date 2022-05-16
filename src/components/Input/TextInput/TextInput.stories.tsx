import { Fragment } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';

import _TextInput from './';
import { SvgPath } from 'components/Icon';

export default {
  component: _TextInput,
  argTypes: {},
} as ComponentMeta<typeof _TextInput>;

const Template: ComponentStory<typeof _TextInput> = (args) => {
  return (
    <Fragment>
      <h2 style={{ color: 'white' }}>no prefix</h2>
      <_TextInput {...args} prefix={undefined} />
      <h2 style={{ color: 'white' }}>string prefix</h2>
      <_TextInput {...args} />
      <h2 style={{ color: 'white' }}>icon prefix</h2>
      <_TextInput {...args} prefix={SvgPath.Search} />
    </Fragment>
  );
};
export const TextInput = Template.bind({});

// TODO: add default props
TextInput.args = {
  placeholder: 'placeholder',
  fullSize: false,
  disabled: false,
  invalid: false,
  prefix: 'prefix',
};
