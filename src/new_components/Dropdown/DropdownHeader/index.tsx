import React, { useCallback, useContext, PropsWithChildren } from 'react';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  id?: string;
}

const DropdownHeader = ({ children, className, id }: PropsWithChildren<Props>) => {
  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = (e: React.MouseEvent) => {
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
  };

  return (
    <div onClick={handleClickDropdownHeader} className={cx('header', className, { active: isOpenMenu })} id={id}>
      {children}
    </div>
  );
};

export default DropdownHeader;
