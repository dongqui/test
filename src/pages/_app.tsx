import { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { NextComponentType } from 'next';
import { Provider } from 'react-redux';
import { AppContext, AppInitialProps, AppProps } from 'next/app';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { ApolloProvider } from '@apollo/client';
import { cache, useApollo } from 'lib/apolloClient';
import { wrapper } from 'store';
import { hotjar } from 'analytics';
import 'styles/core.scss';
import 'styles/timeline/_curve.scss';
import _ from 'lodash';
import store from 'redux/store';

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  const apolloClient = useApollo(pageProps);

  const initialAction = async () => {
    await persistCache({
      cache,
      storage: new LocalStorageWrapper(window.localStorage),
    });
  };

  useEffect(() => {
    hotjar.initialize();
    initialAction();
  }, []);

  return (
    <Fragment>
      <Head>
        <title>shoot</title>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
      </Head>
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Provider>
    </Fragment>
  );
};

export default wrapper.withRedux(App);
