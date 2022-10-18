import React, { useContext, FunctionComponent, useCallback } from 'react';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  disabled?: boolean;
  menuItem: string;
  onClick?: (menuItem: any) => void;
}

const DropdownItem: FunctionComponent<React.PropsWithChildren<Props>> = (props) => {
  const { children, disabled, menuItem, onClick } = props;

  const [_, dispatch] = useContext(DropdownContext);

  // 클릭 이벤트 처리
  const handleClickEvent = useCallback(
    (eventTarget: Node) => {
      const childNodeName = eventTarget.firstChild?.nodeName;
      if (childNodeName === 'A') {
        const anchorTag = eventTarget.firstChild as HTMLAnchorElement;
        anchorTag.click();
      } else {
        onClick && onClick(menuItem);
      }
    },
    [menuItem, onClick],
  );

  // 드랍다운 메뉴 클릭
  const handleMenuItemClick = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      if (!disabled) {
        handleClickEvent(event.target as Node);
        dispatch('changeIsOpenMenu', { isOpenMenu: false });
      }
    },
    [disabled, dispatch, handleClickEvent],
  );

  return (
    <li className={cx('menu-item', { disabled })} onClick={handleMenuItemClick} role="menuitem">
      {children}
    </li>
  );
};

export default DropdownItem;
