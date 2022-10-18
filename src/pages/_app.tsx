import { Fragment, useEffect } from 'react';
import { NextComponentType } from 'next';
import NextApp, { AppContext, AppInitialProps, AppProps } from 'next/app';
import Script from 'next/script';
import { wrapper } from 'store';
import { hotjar } from 'analytics';
import Head from 'next/head';
import TagManager from 'react-gtm-module';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import 'styles/core.scss';

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [new BrowserTracing()],
});

const App: NextComponentType<AppContext, AppInitialProps, AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      hotjar.initialize();
    }
    if (gtmId) {
      TagManager.initialize({ gtmId });
    }

    const productGTM = process.env.NEXT_PUBLIC_PRODUCT_GTM_ID;
    const productGTMAuth = process.env.NEXT_PUBLIC_PRODUCT_GTM_AUTH;
    const productGTMPreview = process.env.NEXT_PUBLIC_PRODUCT_GTM_PREVIEW;

    if (productGTM && productGTMAuth && productGTMPreview) {
      TagManager.initialize({
        gtmId: productGTM,
        auth: productGTMAuth,
        preview: productGTMPreview,
      });
    }
  }, []);

  return (
    <Fragment>
      <Head>
        <title>Plask</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />
      </Head>
      {process.env.NODE_ENV === 'production' && (
        <Fragment>
          <Script
            id="rewardful-loader-1"
            dangerouslySetInnerHTML={{
              __html: `
        (function(w,r){w._rwq=r;w[r]=w[r]||function(){(w[r].q=w[r].q||[]).push(arguments)}})(window,'rewardful');`,
            }}
          />
          <Script src="https://r.wdfl.co/rw.js" data-rewardful="78056c" data-domains="plask.ai" async />
        </Fragment>
      )}
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
