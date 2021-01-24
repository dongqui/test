import { Button } from '@storybook/react/demo';
import { Story, Meta } from '@storybook/react/types-6-0';
import TestButton, { TestButtonProps } from '../../components/Button/TestButton';

const defaultMeta: Meta = {
  title: 'Component/Button',
  component: Button,
};

export default defaultMeta;

const Template: Story<TestButtonProps> = (args) => <TestButton {...args} />;

export const Default = Template.bind({});