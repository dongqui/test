import { Fragment } from 'react';
import { LinkedButton } from 'components/Button';

import styles from './Authentication.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Props {
  /**
   * Possible error cases when accessing the app from the homepage
   * 401.1 - Invalid token
   * 401.2 - Expired token
   * 400   - No permission scene
   * 400.7 - Invalid scene uid
   */
  statusCode: 401.1 | 401.2 | 400 | 400.7;
  message: string;
}

const Authentication = ({ statusCode, message }: Props) => {
  const isRedirectSignin = statusCode === 401.1 || statusCode === 401.2;

  /**
   * Disable redirect in case of authentication error for development convenience
   */
  if (process.env.NODE_ENV === 'production') {
    if (isRedirectSignin) {
      if (process.env.NEXT_PUBLIC_HOMEPAGE_URL) {
        window.location.href = process.env.NEXT_PUBLIC_HOMEPAGE_URL;
        return <Fragment></Fragment>;
      }
    }
  }

  return (
    <div className={cx('wrapper')}>
      <div className={cx('headline')}>
        Oops! <br />
        The page does not exist
      </div>
      <div className={cx('paragraph')}>The link you followed may be broken or the page may have been removed.</div>
      <div className={cx('button-group')}>
        <LinkedButton href="javascript:window.history.back();" variant="filled" size="large">
          Go Back
        </LinkedButton>
        <LinkedButton href={`${process.env.NEXT_PUBLIC_HOMEPAGE_URL}/signin`} variant="outlined" size="large">
          Home
        </LinkedButton>
      </div>
    </div>
  );
};

export default Authentication;
