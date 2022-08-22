import React from 'react';

import classnames from 'classnames/bind';
import styles from './Avata.module.scss';

interface Props {
  userNameInitial: string;
  onClick: React.MouseEventHandler;
}

const cx = classnames.bind(styles);

const Avata = React.forwardRef<HTMLDivElement, Props>(({ userNameInitial, onClick }: Props, ref) => (
  <div className={cx('avata')} onClick={onClick} ref={ref}>
    {userNameInitial}
  </div>
));

Avata.displayName = 'Avata';

export default Avata;
