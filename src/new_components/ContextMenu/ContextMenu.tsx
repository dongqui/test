import _ from 'lodash';
import { FunctionComponent, memo, ReactNode, useEffect, useMemo, useState, useCallback, useRef, useContext, useLayoutEffect, createContext, Fragment } from 'react';
import { BasePortal } from 'components/Modal';
import { IconWrapper, SvgPath } from 'components/Icon';
import classnames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classnames.bind(styles);

type Props = ContextMenu.BaseProps;

const ContextMenu: FunctionComponent<Props> = ({ menu, top, left }) => {
  const portalElement = document.getElementById('__portal-contextmenu');
  const portalRef = useRef(portalElement);

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onContextMenuClose } = useContextMenu();

  // Mounted Position(Saved before position)
  const [position, setPosition] = useState({ top, left });

  // Handling of already open state
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    const currentRef = wrapperRef.current;

    if (currentRef) {
      const { width, height } = currentRef.getBoundingClientRect();

      const beforeState = { top: position.top, left: position.left };
      const nextProps = { top, left };

      const topDiff = Math.abs(nextProps.top - beforeState.top);
      const leftDiff = Math.abs(nextProps.left - beforeState.left);

      let result = { top, left };

      if (!isMounted) {
        if (_.isEqual(topDiff, 0)) {
          if (beforeState.top + height >= window.innerHeight) {
            result.top = position.top - height;
          }

          setIsMounted(true);
        } else {
          if (beforeState.top + height >= window.innerHeight) {
            result.top = position.top - height;
          }
        }

        if (_.isEqual(leftDiff, 0)) {
          if (beforeState.left + width >= window.innerWidth) {
            result.left = position.left - width;
          }

          setIsMounted(true);
        } else {
          if (beforeState.left + width >= window.innerWidth) {
            result.left = position.left - width;
          }
        }
      }

      if (isMounted) {
        if (nextProps.top !== beforeState.top) {
          if (nextProps.top + height >= window.innerHeight) {
            result.top = nextProps.top - height;
          }
        }

        if (nextProps.left !== beforeState.left) {
          if (nextProps.left + width >= window.innerWidth) {
            result.left = nextProps.left - width;
          }
        }
      }

      setPosition({
        top: result.top,
        left: result.left,
      });
    }
  }, [position.left, position.top, , isMounted, left, top]);

  useEffect(() => {
    const handleOutSideClick = (e: MouseEvent) => {
      e.preventDefault();
      onContextMenuClose();
    };

    window.addEventListener('click', handleOutSideClick);

    return () => {
      window.removeEventListener('click', handleOutSideClick);
    };
  }, [onContextMenuClose]);

  const initializeSubMenuVisible = useMemo(
    () =>
      Array(menu.length)
        .fill(0)
        .map(() => false),
    [menu.length],
  );
  const [subMenuVisibleController, setSubMenuVisibleController] = useState<boolean[]>(initializeSubMenuVisible);

  // context menu item 위에서 마우스 이동
  const handleMouseMoveOnItem = useCallback(
    (item: ContextMenu.MenuItem, index: number) => {
      setSubMenuVisibleController(() => {
        const nextState = [...initializeSubMenuVisible];
        if (item.children?.length) nextState[index] = true;
        return nextState;
      });
    },
    [initializeSubMenuVisible],
  );

  return (
    <BasePortal container={portalRef}>
      <div className={cx('wrapper')} ref={wrapperRef} style={{ top: position.top, left: position.left }}>
        {menu &&
          menu.map((item, i) => {
            const classes = cx('inner', item.visibility, { disabled: item.disabled }, { 'has-children': !!item.children });

            const handleMenuClick = () => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onContextMenuClose();
              }
            };

            return (
              <Fragment key={i}>
                <div className={classes} onMouseMove={() => handleMouseMoveOnItem(item, i)}>
                  <div
                    className={cx('item', { disabled: item.disabled }, { 'has-children': !!item.children?.length }, { 'focus-children': subMenuVisibleController[i] })}
                    onClick={handleMenuClick}
                  >
                    {item.label}
                    {!!item.children?.length && <IconWrapper icon={SvgPath.ChevronRight} />}
                  </div>
                  {!!item.children?.length && subMenuVisibleController[i] && (
                    <div className={cx('sub-menu')}>
                      {item.children.map((subItem) => (
                        <div key={subItem.label} className={cx('sub-item')}>
                          {subItem.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {item.separator && <div className={cx('separator')} />}
              </Fragment>
            );
          })}
      </div>
    </BasePortal>
  );
};

const ContextMenuContext = createContext<ContextMenu.Handler>({
  handleOpen: () => {},
  handleClose: () => {},
});

// const ContextMenuContext = createContext<any>({});

/**
 * Provider of 'ContextMenu'
 *
 * ```ts
 * <ContextMenuProvider>
 *   <Example />
 * </ContextMenuProvider>
 * ```
 *
 * @param {ReactNode} children
 */
const ContextMenuProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [props, setProps] = useState<Props>({ top: 0, left: 0, menu: [] });

  const handleOpen = ({ top, left, menu }: Props) => {
    setProps({ top, left, menu });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <ContextMenuContext.Provider value={{ handleOpen, handleClose }}>
      {children}
      {isOpen && <ContextMenu {...props} />}
    </ContextMenuContext.Provider>
  );
};

// Custom Hooks
const useContextMenu = () => {
  const { handleOpen, handleClose } = useContext(ContextMenuContext);

  const onContextMenuOpen = ({ ...props }: Props) => {
    handleOpen({ ...props });
  };

  const onContextMenuClose = () => {
    handleClose();
  };

  return { onContextMenuOpen, onContextMenuClose };
};

export { ContextMenuProvider, useContextMenu };
export default memo(ContextMenu);
