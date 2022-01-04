import React, { FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuItem.module.scss';
import { ContextMenuClickItemHandler } from 'types/common';

const cx = classnames.bind(styles);

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, 'disabled' | 'onClick'> {
  disabled?: boolean;
  propsFromTrigger?: any;
  onClick: ContextMenuClickItemHandler;
}

const ContextMenuItem: FunctionComponent<Props> = ({ disabled = false, children, onClick, propsFromTrigger, ...rest }) => {
  function handleClick(e: React.MouseEvent<HTMLElement>) {
    disabled ? e.stopPropagation() : onClick(e, propsFromTrigger);
  }

  return (
    <div className={cx('item')} onClick={handleClick} aria-disabled={disabled} {...rest}>
      {children}
    </div>
  );
};

export default ContextMenuItem;
