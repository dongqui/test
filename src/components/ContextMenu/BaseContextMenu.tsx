import React, { useRef, useEffect, Fragment, FunctionComponent, useState, useLayoutEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { getMousePosition } from 'utils/common';
import * as globalUIActions from 'actions/Common/globalUI';
import classnames from 'classnames/bind';
import styles from './BaseContextMenu.module.scss';

const cx = classnames.bind(styles);

interface Props {
  children?: ReactNode;
}

export const ContextMenu: FunctionComponent<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const contextMenu = useSelector((state) => state.globalUI.contextMenu);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function initContextMenuPosition() {
      if (contextMenu && nodeRef.current) {
        const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
        const { offsetWidth: menuWidth, offsetHeight: menuHeight } = nodeRef.current;
        let { x, y } = getMousePosition(contextMenu.event);

        if (x + menuWidth > windowWidth) {
          x -= x + menuWidth - windowWidth;
        }
        if (y + menuHeight > windowHeight) {
          y -= y + menuHeight - windowHeight;
        }

        setPosition({ x, y });
      }
    }

    function closeContextMenu() {
      dispatch(globalUIActions.closeContextMenu());
    }

    if (contextMenu) {
      window.addEventListener('click', closeContextMenu);
    }

    initContextMenuPosition();

    return () => {
      window.removeEventListener('click', closeContextMenu);
    };
  }, [contextMenu, dispatch]);

  const menuStyle = {
    left: position?.x,
    top: position?.y,
  };

  return (
    <div className={cx('wrapper')} ref={nodeRef} style={menuStyle}>
      {children}
    </div>
  );
};

export default ContextMenu;
