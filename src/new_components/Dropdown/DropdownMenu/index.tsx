import { useContext, useRef, FunctionComponent, useState, useLayoutEffect, ReactNode, RefObject } from 'react';
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
  transform?: string;
}

interface Props {
  children: ReactNode;
  innerRef?: RefObject<HTMLDivElement>;
  className?: string;
}

const DropdownMenu = (props: Props) => {
  const { children, innerRef, className } = props;

  const dropdownMenuRef = useRef<HTMLUListElement>(null);
  const [_, dispatch] = useContext(DropdownContext);
  const [style, setStyle] = useState<Position>({
    top: 0,
    right: undefined,
    bottom: 'initial',
    left: 0,
    transform: '',
  });

  useLayoutEffect(() => {
    const currentRef = dropdownMenuRef.current;
    const parentRef = innerRef?.current;

    if (parentRef && currentRef) {
      const parentRect = parentRef.getBoundingClientRect();
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
        style.top = 0;
        style.bottom = 'initial';
      }

      style.transform = `translate3d(0, ${parentRect.height}px, 0)`;

      setStyle(style);
    }
  }, [innerRef]);

  return (
    <ul className={cx('menu', className)} role="menu" ref={dropdownMenuRef} style={style}>
      {children}
    </ul>
  );
};

const DropdownMenuWrapper: FunctionComponent<React.PropsWithChildren<Props>> = (props) => {
  const { children, ...rest } = props;

  const [{ isOpenMenu }] = useContext(DropdownContext);

  // isOpenMenu가 true인 경우에만 DropdownMenu와 children을 출력. false인 경우에는 출력 된 컴포넌트 소멸
  return <>{isOpenMenu && <DropdownMenu {...rest}>{children}</DropdownMenu>}</>;
};

export default DropdownMenuWrapper;
