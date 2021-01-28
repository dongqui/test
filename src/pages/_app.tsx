import React, { useEffect } from 'react';
import { ThemeProvider } from '@emotion/react';
import { NextComponentType } from 'next';
import Head from 'next/head';
import { ApolloProvider } from '@apollo/client';
import { AppContext, AppInitialProps, AppProps } from 'next/app';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { cache, useApollo } from '../lib/apolloClient';

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({ Component, pageProps }) => {
  // const { isTheme, changeMode } = useTheme();
  // const theme = isTheme === 'light' ? '' : '';

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
    <>
      <Head>
        <title>shoot</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
      </Head>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  );
};
export default App;
