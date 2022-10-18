import { useEffect, Fragment, useState } from 'react';
import { GetServerSideProps } from 'next';

import { IconWrapper, SvgPath, FilledButton } from 'components';
import { tokenManager } from 'api/requestApi';
import * as api from 'api';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface PageProps {
  token: string;
  interval: string;
}

export default function Success({ token, interval }: PageProps) {
  const [opener, setOpener] = useState<boolean>(false);
  useEffect(() => {
    tokenManager.set(token);

    if (!window.opener) {
      window.location.href = '/';
    } else {
      setOpener(true);
    }
  }, [token]);

  async function handleClickTryAgain() {
    const stripeURL: string = await api.createStripeSession(interval === 'month');
    window.location.href = stripeURL;
  }

  const isValidInterval = interval === 'month' || interval === 'year';

  if (opener) {
    return (
      <div className={cx('container')}>
        <div>
          <IconWrapper icon={SvgPath.WarningTriangle} />
          <p className={cx('failed-text')}>Payment failed</p>
          <p className={cx('retry-text')}>Unfortunately, we couldn&apos;t process this payment. Please try again.</p>
          {isValidInterval && (
            <FilledButton buttonType="negative" onClick={handleClickTryAgain}>
              Try again
            </FilledButton>
          )}
        </div>
      </div>
    );
  } else {
    return <Fragment />;
  }
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = process.env.NODE_ENV === 'development' ? process.env.DEV_LOCAL_TOKEN : context.req?.cookies?.authToken;

  return {
    props: {
      token: token || '',
      interval: context.query?.interval || '',
    },
  };
};
