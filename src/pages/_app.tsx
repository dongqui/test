import _ from 'lodash';
import { Fragment, useEffect } from 'react';
import { NextComponentType } from 'next';
import { AppContext, AppInitialProps, AppProps } from 'next/app';
import { wrapper } from 'store';
import { hotjar } from 'analytics';
import Head from 'next/head';
import 'styles/core.scss';

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
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  );
};

export default wrapper.withRedux(App);
