import { forwardRef } from 'react';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: React.ReactNode;
}

const BaseTemplate = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children } = props;

  return (
    <div className={cx('tooltip')} ref={ref}>
      <div className={cx('body')}>{children}</div>
    </div>
  );
});

BaseTemplate.displayName = 'BaseTemplate';

export default BaseTemplate;
