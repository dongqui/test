import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { Icon as IconComponent, IconProps } from '../../components/IconTree/Icon';

export default {
  title: 'Component API/Component/IconTree/Icon',
  component: IconComponent,
  argTypes: {
    maxFileNameLength: {
      description: '이 파일 길이 이상이면 그 다음부턴 ...으로 짤림',
    },
    onEnterFileName: {
      description: '파일이름 입력하고 엔터 딱 쳤을때 발생시킬 이벤트',
    },
  },
  args: {},
} as Meta;

const Template: Story<IconProps> = (args) => (
  <div style={{ backgroundColor: 'black' }}>
    <IconComponent {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  width: '8%',
  height: '8rem',
};
