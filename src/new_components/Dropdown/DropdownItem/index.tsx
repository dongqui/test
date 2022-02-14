import { useContext, FunctionComponent, useCallback, KeyboardEvent } from 'react';
import { isEqual } from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  disabled?: boolean;
  menuItem: string;
  onClick: (menuItem: any) => void;
}

const DropdownItem: FunctionComponent<Props> = (props) => {
  const { children, disabled, menuItem, onClick } = props;

  const [_, dispatch] = useContext(DropdownContext);

  // 드랍다운 메뉴 클릭
  const handleClickMenuItem = useCallback(() => {
    if (!disabled) {
      dispatch('changeIsOpenMenu', { isOpenMenu: false });
      onClick(menuItem);
    }
  }, [disabled, menuItem, dispatch, onClick]);

  // 엔터 입력 시 드랍다운 메뉴 클릭 이벤트 호출
  const handleKeydownMenuItem = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!disabled && isEqual(event.key, 'Enter')) {
        handleClickMenuItem();
      }
    },
    [disabled, handleClickMenuItem],
  );

  return (
    <li className={cx('menu-item', { disabled })} onClick={handleClickMenuItem} onKeyDown={handleKeydownMenuItem} role="menuitem">
      {children}
    </li>
  );
};

export default DropdownItem;
