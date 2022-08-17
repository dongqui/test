import { useContext, useEffect, useRef, FunctionComponent, useState } from 'react';
import { isEqual } from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Position {
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
}

interface Props {
  autoClose?: boolean;

  onClose?: (params?: any) => void;
}

const DropdownMenu: FunctionComponent<Props> = (props) => {
  const { autoClose = true, children, onClose } = props;

  const dropdownMenuRef = useRef<HTMLUListElement>(null);
  const [_, dispatch] = useContext(DropdownContext);
  const [position, setPosition] = useState<Position>({
    top: 0,
    right: undefined,
    bottom: 'initial',
    left: 0,
  });

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
        if (isEqual(event.key, 'Escape') && autoClose) {
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

  useEffect(() => {
    const currentRef = dropdownMenuRef.current;
    if (currentRef) {
      const { innerWidth, innerHeight } = window;
      const rect = currentRef.getBoundingClientRect();
      const style: Position = {};

      if (rect.right < innerWidth) {
        style.left = 0;
        style.right = undefined;
      } else {
        style.right = 0;
        style.left = undefined;
      }

      if (rect.bottom > innerHeight) {
        style.bottom = 0;
        style.top = 'initial';
      } else {
        style.bottom = 'initial';
      }

      setPosition(style);
    }
  }, []);

  const menuStyle = {
    ...position,
  };

  return (
    <ul className={cx('menu')} role="menu" ref={dropdownMenuRef} style={menuStyle}>
      {children}
    </ul>
  );
};

const DropdownMenuWrapper: FunctionComponent<Props> = (props) => {
  const { children, ...rest } = props;

  const [{ isOpenMenu }] = useContext(DropdownContext);

  // isOpenMenu가 true인 경우에만 DropdownMenu와 children을 출력. false인 경우에는 출력 된 컴포넌트 소멸
  return <>{isOpenMenu && <DropdownMenu {...rest}>{children}</DropdownMenu>}</>;
};

export default DropdownMenuWrapper;
