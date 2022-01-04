import React, { ReactNode, useEffect, useRef, useState, FunctionComponent } from 'react';
import classnames from 'classnames/bind';
import styles from './ContextMenuSubmenu.module.scss';

const cx = classnames.bind(styles);

export interface Props {
  label: ReactNode;
  arrow?: ReactNode;
  disabled?: boolean;
}

interface Position {
  left?: string | number;
  right?: string | number;
  top?: string | number;
  bottom?: string | number;
}

const SUBMENU_OFFSET = '100%';

const ContextMenuSubmenu: FunctionComponent<Props> = ({ children, arrow = '▶', disabled = false, label }) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({
    top: 0,
    right: undefined,
    bottom: 'initial',
    left: SUBMENU_OFFSET,
  });

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

  function handleClick(e: React.SyntheticEvent) {
    e.stopPropagation();
  }

  const submenuStyle = {
    ...position,
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('trigger')} onClick={handleClick}>
        {label}
        <span className={cx('arrow')}>{arrow}</span>
      </div>
      <div className={cx('submenu')} ref={nodeRef} style={submenuStyle}>
        {children}
      </div>
    </div>
  );
};

export default ContextMenuSubmenu;
