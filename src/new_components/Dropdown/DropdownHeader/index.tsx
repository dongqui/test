import { useCallback, useContext, ReactChildren, ReactChild } from 'react';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: ReactChildren | ReactChild;
  onClose?: (params?: any) => void;
  className?: string;
}

const DropdownHeader = ({ children, onClose, className }: Props) => {
  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = useCallback(() => {
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
    if (isOpenMenu && onClose) {
      onClose();
    }
  }, [isOpenMenu, dispatch, onClose]);

  return (
    <div onClick={handleClickDropdownHeader} className={cx(className)}>
      {children}
    </div>
  );
};

export default DropdownHeader;
