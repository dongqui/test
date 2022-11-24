import { Fragment, ReactNode, useContext, useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children?: ReactNode;
  autoClose?: boolean;
}

const DropdownInner = ({ children, autoClose }: Props) => {
  const [_, dispatch] = useContext(DropdownContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드랍다운 메뉴 출력 시, window에 click/keydown/focus 이벤트 추가
  useEffect(() => {
    const currentRef = dropdownRef.current;

    if (currentRef) {
      const handleOutSideClick = (event: MouseEvent) => {
        const target = event.target as Node;
        const isContains = currentRef.contains(target);
        if (!isContains && autoClose) {
          dispatch('changeIsOpenMenu', { isOpenMenu: false });
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
  }, [autoClose, dispatch]);

  return (
    <div ref={dropdownRef} className={cx('dropdown-inner')}>
      {children}
    </div>
  );
};

export default DropdownInner;
