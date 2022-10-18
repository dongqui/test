import { useEffect, useState, Fragment } from 'react';
import { GetServerSideProps } from 'next';

import { useInterval, useSetTimeout } from 'hooks/common';
import { getUserPlanInfo } from 'api';
import { tokenManager } from 'api/requestApi';
import { Spinner, SvgPath, IconWrapper } from 'components';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

interface PageProps {
  token: string;
}

export default function Success({ token }: PageProps) {
  const [opener, setOpener] = useState(false);
  const [intervalTime, setIntervalTime] = useState<number | null>(1000);
  const [timeoutTime, setTimeoutTime] = useState<number | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    tokenManager.set(token);

    if (!window.opener) {
      window.location.href = '/';
    } else {
      setOpener(true);
    }
  }, [token]);

  useInterval(intervalTime, async () => {
    const planInfo = await getUserPlanInfo();
    setTime((prev) => prev + 1);

    // TODO: 좀 더 확장성 있게...!
    if (planInfo.name === 'Motion Capture Pro' || time >= 10) {
      window?.opener?.document?.getElementById('handle-payment-success').click();
      setIntervalTime(null);
      setTimeoutTime(2000);
    }
  });

  useSetTimeout(timeoutTime, () => {
    window.close();
  });

  function renderPage() {
    const paymentLoadingDone = !!timeoutTime;
    if (paymentLoadingDone) {
      return (
        <div>
          <IconWrapper className={cx('check-icon')} icon={SvgPath.CheckThin} />
          <p className={cx('success-text')}>Payment successful</p>
        </div>
      );
    } else {
      return (
        <div>
          <Spinner>
            <IconWrapper className={cx('spin-logo-icon')} icon={SvgPath.Logo} />
          </Spinner>
          <p className={cx('process-text')}>Processing your payment...</p>
          <p className={cx('thanks-text')}>Thank you for your order. Please wait for a while.</p>
        </div>
      );
    }
  }

  if (!opener) {
    return <Fragment />;
  }

  return <div className={cx('container')}>{renderPage()}</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = process.env.NODE_ENV === 'development' ? process.env.DEV_LOCAL_TOKEN : context.req?.cookies?.authToken;

  return {
    props: {
      token: token || '',
    },
  };
};
