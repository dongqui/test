import { Story, Meta } from '@storybook/react/types-6-0';
import Component, { Props } from 'components/New_Typography/Headline';

export default {
  title: 'Component API/Component/New_Typography',
  component: Component,
  args: {},
} as Meta;

const Template: Story<Props> = ({ level, ...args }) => {
  return (
    <>
      <Component level="1" {...args}>
        h1.Headline1
      </Component>
      <Component level="2" {...args}>
        h2.Headline2
      </Component>
      <Component level="3" {...args}>
        h3.Headline3
      </Component>
      <Component level="4" {...args}>
        h4.Headline4
      </Component>
      <Component level="5" {...args}>
        h5.Headline5
      </Component>
      <Component level="6" {...args}>
        h6.Headline6
      </Component>
    </>
  );
};

export const Headline = Template.bind({});

Headline.args = {
  margin: true,
};
