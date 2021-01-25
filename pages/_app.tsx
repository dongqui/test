import React, { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { NextComponentType } from 'next';
import { AppContext, AppInitialProps, AppProps } from 'next/app';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { cache, useApollo } from '../lib/apolloClient';

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);
  const initialAction = async () => {
    await persistCache({
      cache,
      storage: new LocalStorageWrapper(window.localStorage),
    });
  };
  useEffect(() => {
    initialAction();
  }, []);
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};
export default App;
