import React, { FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuItem.module.scss';

const cx = classnames.bind(styles);

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, 'disabled' | 'onClick'> {
  disabled?: boolean;
  onClick: React.MouseEventHandler;
}

const ContextMenuItem: FunctionComponent<Props> = ({ children, disabled = false, onClick, ...rest }) => {
  return (
    <div className={cx('item')} onClick={onClick} aria-disabled={disabled} {...rest}>
      {children}
    </div>
  );
};

export default ContextMenuItem;
