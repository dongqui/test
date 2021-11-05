import _ from 'lodash';
import { Fragment, useEffect } from 'react';
import NextApp, { AppContext, AppInitialProps, AppProps } from 'next/app';
import { NextComponentType } from 'next';
import { wrapper } from 'store';
import { hotjar } from 'analytics';
import Head from 'next/head';
import 'styles/core.scss';

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      hotjar.initialize();
    }
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

App.getInitialProps = async (context: AppContext) => {
  const { ctx } = context;
  const appProps = await NextApp.getInitialProps(context);

  let userAgent;
  let browserType;
  const UA = ctx.req?.headers['user-agent'] || navigator.userAgent;

  if (ctx.req) {
    userAgent = ctx.req.headers['user-agent'];
  }

  if (UA) {
    const lowerCase = UA.toLowerCase();
    const bothChromeSafari = lowerCase.includes('safari');
    const ifIncludeSafari = !lowerCase.includes('chrome');
    const safariIncludesVersion = lowerCase.indexOf('version/') !== 1;

    browserType = bothChromeSafari && ifIncludeSafari && safariIncludesVersion ? 'safari' : 'else';
  }

  const props = {
    userAgent,
    browserType,
    ...appProps,
  };

  return {
    pageProps: {
      ...props,
    },
  };
};

export default wrapper.withRedux(App);
