import { useCallback, useContext, ReactChildren, ReactChild } from 'react';

import { DropdownContext } from '../DropdownProvider';

import { SvgPath } from 'components/Icon';
import { ExpandButton } from 'components/Button';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: ReactChildren | ReactChild;
  onClose?: (params?: any) => void;
}

const DropdownHeader = ({ children, onClose }: Props) => {
  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = useCallback(() => {
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
    if (isOpenMenu && onClose) {
      onClose();
    }
  }, [isOpenMenu, dispatch, onClose]);

  return <div onClick={handleClickDropdownHeader}>{children}</div>;
};

export default DropdownHeader;
