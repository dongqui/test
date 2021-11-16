import _ from 'lodash';
import { FunctionComponent, memo, ReactNode, useEffect, useState, useCallback, useRef, useContext, useLayoutEffect, createContext, Fragment } from 'react';
import { BasePortal } from 'components/Modal';
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
      const target = e.target as Node;

      if (wrapperRef.current) {
        const isContains = wrapperRef.current.contains(target);

        if (!isContains) {
          onContextMenuClose();
        }
      }
    };

    window.addEventListener('click', handleOutSideClick);

    return () => {
      window.removeEventListener('click', handleOutSideClick);
    };
  }, [onContextMenuClose]);

  return (
    <BasePortal container={portalRef}>
      <div className={cx('wrapper')} ref={wrapperRef} style={{ top: position.top, left: position.left }}>
        {menu &&
          menu.map((item, i) => {
            const classes = cx('inner', item.visibility, { disabled: item.disabled });

            const handleMenuClick = () => {
              if (!item.disabled && item.onClick) {
                item.onClick();
                onContextMenuClose();
              }
            };

            return (
              <Fragment key={i}>
                <div className={classes}>
                  <div className={cx('item', { disabled: item.disabled })} onClick={handleMenuClick}>
                    {item.label}
                  </div>
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
