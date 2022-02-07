import React, { FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuItem.module.scss';

const cx = classnames.bind(styles);

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, 'disabled' | 'onClick'> {
  disabled?: boolean;
  onClick: React.MouseEventHandler;
}

const ContextMenuItem: FunctionComponent<Props> = ({ children, disabled = false, onClick, ...rest }) => {
  const _onClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
    } else {
      onClick(e);
    }
  };
  return (
    <div className={cx('item', { disabled })} onClick={_onClick} {...rest}>
      {children}
    </div>
  );
};

export default ContextMenuItem;
