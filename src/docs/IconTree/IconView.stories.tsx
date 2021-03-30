import React from 'react';
import '../common.css';
import { Story, Meta } from '@storybook/react/types-6-0';
import { IconView as IconViewComponent, IconViewProps } from '../../containers/IconTree/IconView';
import { useApollo } from 'lib/apolloClient';
import { ApolloProvider } from '@apollo/client';

export default {
  title: 'Component API/Container/IconTree/IconView',
  component: IconViewComponent,
  args: {},
} as Meta;

const Template: Story<IconViewProps> = (args) => {
  const apolloClient = useApollo(args);
  return (
    <ApolloProvider client={apolloClient}>
      <IconViewComponent {...args} />
    </ApolloProvider>
  );
};

export const Default = Template.bind({});
