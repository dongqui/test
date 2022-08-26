import { SvgPath, Spinner, IconWrapper } from 'components';

import classnames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classnames.bind(styles);

export default function PageLoading() {
  return (
    <div className={cx('container')}>
      <div>
        <Spinner>
          <IconWrapper className={cx('spin-logo-icon')} icon={SvgPath.Logo} />
        </Spinner>
        <span className={cx('loading-text')}>Loading...</span>
      </div>
    </div>
  );
}
