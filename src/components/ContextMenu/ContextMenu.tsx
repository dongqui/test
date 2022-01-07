import React, { useRef, useEffect, Fragment, FunctionComponent, useState, useLayoutEffect } from 'react';
import eventManager from './eventManager';
import { getMousePosition, cloneItemsWithProps } from 'utils/common';
import classnames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classnames.bind(styles);

interface Props {
  /** contextmenu를 구별하 유니크한 값 */
  contextMenuId: string;
}

export const ContextMenu: FunctionComponent<Props> = ({ contextMenuId, children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [propsFromTrigger, setPropsFromTrigger] = useState<any>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    eventManager.on(contextMenuId, show);
    eventManager.on('hideAll', hide);

    return () => {
      eventManager.off(contextMenuId, show);
      eventManager.off('hideAll', hide);
    };
  }, [contextMenuId]);

  useLayoutEffect(() => {
    if (isOpen) {
      const { innerWidth: windowWidth, innerHeight: windowHeight } = window;
      const { offsetWidth: menuWidth, offsetHeight: menuHeight } = nodeRef.current!;
      let { x, y } = position;

      if (x + menuWidth > windowWidth) {
        x -= x + menuWidth - windowWidth;
      }

      if (y + menuHeight > windowHeight) {
        y -= y + menuHeight - windowHeight;
      }

      if (position.x !== x || position.y !== y) {
        setPosition({ x, y });
      }
    }
  }, [position, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('contextmenu', hide);
      window.addEventListener('click', hide);
    }

    return () => {
      window.removeEventListener('contextmenu', hide);
      window.removeEventListener('click', hide);
    };
  }, [isOpen]);

  function hide() {
    setIsOpen(false);
  }

  function show({ event, props }: { event: React.MouseEvent<HTMLInputElement>; props: any }) {
    event.stopPropagation();

    setPosition(getMousePosition(event));
    setIsOpen(true);
    setPropsFromTrigger(props);
  }

  const menuStyle = {
    left: position.x,
    top: position.y,
  };

  return (
    <Fragment>
      {isOpen && (
        <div className={cx('wrapper')} ref={nodeRef} style={menuStyle}>
          {cloneItemsWithProps(children, { propsFromTrigger })}
        </div>
      )}
    </Fragment>
  );
};

export default ContextMenu;
