import { useCallback, useContext, FunctionComponent } from 'react';
import _ from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const DropdownHeader: FunctionComponent<Props> = (props) => {
  const { children } = props;

  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = useCallback(() => {
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
  }, [isOpenMenu, dispatch]);

  return (
    <button className={cx('header', { expanded: isOpenMenu })} type="button" onClick={handleClickDropdownHeader}>
      {children}
    </button>
  );
};

export default DropdownHeader;
