import React, { useCallback, useContext, PropsWithChildren } from 'react';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onClose?: (params?: any) => void;
  className?: string;
  id?: string;
}

const DropdownHeader = ({ children, onClose, className, id }: PropsWithChildren<Props>) => {
  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
    if (isOpenMenu && onClose) {
      onClose();
    }
  };

  return (
    <div onClick={handleClickDropdownHeader} className={cx(className)} id={id}>
      {children}
    </div>
  );
};

export default DropdownHeader;
