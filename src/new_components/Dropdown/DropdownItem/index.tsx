import { useContext, FunctionComponent, useCallback, KeyboardEvent } from 'react';
import { isEqual } from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  menuItem: string;
  onClick: (menuItem: any) => void;
}

const DropdownItem: FunctionComponent<Props> = (props) => {
  const { children, menuItem, onClick } = props;

  const [_, dispatch] = useContext(DropdownContext);

  // 드랍다운 메뉴 클릭
  const handleClickMenuItem = useCallback(() => {
    dispatch('changeIsOpenMenu', { isOpenMenu: false });
    onClick(menuItem);
  }, [menuItem, dispatch, onClick]);

  // 엔터 입력 시 드랍다운 메뉴 클릭 이벤트 호출
  const handleKeydownMenuItem = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (isEqual(event.key, 'Enter')) {
        handleClickMenuItem();
      }
    },
    [handleClickMenuItem],
  );

  return (
    <li tabIndex={0} className={cx('menu-item')} onClick={handleClickMenuItem} onKeyDown={handleKeydownMenuItem} role="menuitem">
      {children}
    </li>
  );
};

export default DropdownItem;
