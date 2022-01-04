import React, { FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuItem.module.scss';

const cx = classnames.bind(styles);

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, 'disabled'> {
  disabled?: boolean;
}

const ContextMenuItem: FunctionComponent<Props> = ({ children, ...rest }) => {
  return (
    <div className={cx('item')} {...rest}>
      {children}
    </div>
  );
};

export default ContextMenuItem;
