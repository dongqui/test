import { Fragment, useState } from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import _ExpandButton from './';
import { SvgPath } from 'components/Icon';

export default {
  component: _ExpandButton,
  argTypes: {
    content: {
      description: 'Text Button으로 사용 시 RAW 모드에서 "Text"로 사용',
    },
  },
} as ComponentMeta<typeof _ExpandButton>;

const Template: ComponentStory<typeof _ExpandButton> = (args) => {
  const [onDropdown, setOnDropdown] = useState(false);

  return (
    <Fragment>
      {onDropdown && (
        <div
          className="overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            color: 'white',
            textAlign: 'right',
            fontSize: '15px',
            zIndex: 10,
          }}
          onClick={() => setOnDropdown(false)}
        >
          overlay (storybook 전용)
        </div>
      )}
      <_ExpandButton {...args} style={{ filter: onDropdown ? 'brightness(120%)' : undefined }} onClick={() => setOnDropdown((prev) => !prev)} />
    </Fragment>
  );
};
export const ExpandButton = Template.bind({});

ExpandButton.args = {
  fullSize: false,
  disabled: false,
  variant: 'default',
  content: SvgPath.EyeOpen,
};
