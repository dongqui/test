import AlertModal from './AlertModal';
import { ComponentMeta, ComponentStory } from '@storybook/react';

export default {
  title: 'Modalss',
  component: AlertModal,
} as ComponentMeta<typeof AlertModal>;

const Template: ComponentStory<typeof AlertModal> = (args) => <AlertModal {...args} />;
export const TextButton = Template.bind({});
