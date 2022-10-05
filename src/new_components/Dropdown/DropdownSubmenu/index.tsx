import React, { useContext, useEffect, useRef, useState, ReactNode } from 'react';

import { DropdownContext } from '../DropdownProvider';
import { IconWrapper, SvgPath } from 'components/Icon';

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
  label: ReactNode;
  arrow?: ReactNode;
  disabled?: boolean;
  children: ReactNode;
  classNames?: string;
}

const SUBMENU_OFFSET = '100%';

const DropdownSubmenu = ({ children, label, arrow = '>', classNames }: Props) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [showSubmenu, setShowSubmenu] = useState(false);
  const [position, setPosition] = useState<Position>({
    top: 0,
    right: undefined,
    bottom: 'initial',
    left: SUBMENU_OFFSET,
  });
  const [_, dispatch] = useContext(DropdownContext);

  useEffect(() => {
    if (nodeRef.current) {
      const { innerWidth, innerHeight } = window;
      const rect = nodeRef.current.getBoundingClientRect();
      const style: Position = {};

      if (rect.right < innerWidth) {
        style.left = SUBMENU_OFFSET;
        style.right = undefined;
      } else {
        style.right = SUBMENU_OFFSET;
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

  const handleMouseEnter = () => {
    setShowSubmenu(true);
  };

  const handleMouseLeave = () => {
    setShowSubmenu(false);
  };

  const submenuStyle = {
    ...position,
  };

  return (
    <div className={cx('wrapper', classNames)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={cx('trigger')}>
        {label}
        {/* <span className={cx('arrow')}>{arrow}</span> */}
        <IconWrapper className={cx('arrow')} icon={SvgPath.ChevronRight} />
      </div>
      {showSubmenu && (
        <div className={cx('submenu')} ref={nodeRef} style={submenuStyle}>
          {children}
        </div>
      )}
    </div>
  );
};
export default DropdownSubmenu;
