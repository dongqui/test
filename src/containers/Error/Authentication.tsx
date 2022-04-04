import { LinkedButton } from 'components/Button';

import styles from './Authentication.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Props {
  statusCode: number;
  message: string;
}

const Authentication = ({ statusCode, message }: Props) => {
  console.log(statusCode, message);
  // 401.1 -> Invalid token
  // 401.2 -> Expired Token
  // 400.99 -> 400 -> No Permission Scene
  // 400.7 -> Invalid scenes uid

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
        <LinkedButton href="https://plask.ai/signin" variant="outlined" size="large">
          Home
        </LinkedButton>
      </div>
    </div>
  );
};

export default Authentication;
