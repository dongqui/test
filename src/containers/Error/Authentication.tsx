import styles from './Authentication.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

interface Props {
  statusCode: number;
  message: string;
}

const Authentication = ({ statusCode, message }: Props) => {
  console.log(statusCode, message);
  // 401.1 -> invalid token
  // 401.2 -> 토큰만료
  // 400.99 -> 400 ->
  return (
    <div className={cx('wrapper')}>
      <div className={cx('headline')}>
        Oops! <br />
        The page does not exist
      </div>
      <div className={cx('paragraph')}>The lionk you followed may be broken or the page may have been removed.</div>
      <div className={cx('button-group')}>
        <button>Go Back</button>
        <button>Go Home</button>
      </div>
    </div>
  );
};

export default Authentication;
