import { useContext, useEffect, useRef, Fragment, FunctionComponent } from 'react';
import { isEqual } from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  autoClose?: boolean;

  onClose?: (params?: any) => void;
}

const DropdownMenu: FunctionComponent<Props> = (props) => {
  const { autoClose, children, onClose } = props;

  const dropdownMenuRef = useRef<HTMLUListElement>(null);
  const [_, dispatch] = useContext(DropdownContext);

  // 드랍다운 메뉴 출력 시, window에 click/keydown/focus 이벤트 추가
  useEffect(() => {
    const currentRef = dropdownMenuRef.current;

    if (currentRef) {
      const handleOutSideClick = (event: MouseEvent) => {
        const target = event.target as Node;
        const isContains = currentRef.contains(target);
        if (!isContains && autoClose) {
          dispatch('changeIsOpenMenu', { isOpenMenu: false });
          onClose && onClose();
        }
      };

      const handleFocusin = (event: FocusEvent) => {
        if (!currentRef.contains(event.target as Node)) {
          event.preventDefault();
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (isEqual(event.key, 'Escape' && autoClose)) {
          dispatch('changeIsOpenMenu', { isOpenMenu: false });
          onClose && onClose();
        }

        if (isEqual(event.key, 'Enter')) {
          event.preventDefault();
        }
      };

      window.addEventListener('click', handleOutSideClick);
      window.addEventListener('focusin', handleFocusin);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('click', handleOutSideClick);
        window.removeEventListener('focusin', handleFocusin);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [autoClose, dispatch, onClose]);

  return (
    <ul className={cx('menu')} role="menu" ref={dropdownMenuRef}>
      {children}
    </ul>
  );
};

const DropdownMenuWrapper: FunctionComponent<Props> = (props) => {
  const { children, ...rest } = props;

  const [{ isOpenMenu }] = useContext(DropdownContext);

  // isOpenMenu가 true인 경우에만 DropdownMenu와 children을 출력. false인 경우에는 출력 된 컴포넌트 소멸
  return <Fragment>{isOpenMenu && <DropdownMenu {...rest}>{children}</DropdownMenu>}</Fragment>;
};

export default DropdownMenuWrapper;
