import { Fragment, useEffect } from 'react';
import Head from 'next/head';
import { NextComponentType } from 'next';
import { Provider } from 'react-redux';
import { AppContext, AppInitialProps, AppProps } from 'next/app';
import { LocalStorageWrapper, persistCache } from 'apollo3-cache-persist';
import { ApolloProvider } from '@apollo/client';
import { wrapper } from 'store';
import { hotjar } from 'analytics';
import 'styles/core.scss';
import 'styles/timeline/_curve.scss';
import _ from 'lodash';

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({
  Component,
  pageProps,
}) => {
  useEffect(() => {
    hotjar.initialize();
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
      <Component {...pageProps} />
    </Fragment>
  );
};

export default wrapper.withRedux(App);
