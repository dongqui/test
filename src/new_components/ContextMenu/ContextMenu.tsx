import _ from 'lodash';
import {
  FunctionComponent,
  memo,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext,
  useLayoutEffect,
  createContext,
} from 'react';
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

  const [position, setPosition] = useState({ top, left });
  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    const currentRef = wrapperRef.current;

    if (currentRef) {
      const { width, height } = currentRef.getBoundingClientRect();

      const nextProps = { top, left };
      const beforeProps = { top: position.top, left: position.left };

      const topDiff = Math.abs(nextProps.top - beforeProps.top);
      const leftDiff = Math.abs(nextProps.left - beforeProps.left);

      let result = { top, left };

      if (!isMounted) {
        if (_.isEqual(topDiff, 0)) {
          if (beforeProps.top + height >= window.innerHeight) {
            result.top = position.top - height;
          }

          setIsMounted(true);
        } else {
          if (beforeProps.top + height >= window.innerHeight) {
            result.top = position.top - height;
          }
        }

        if (_.isEqual(leftDiff, 0)) {
          if (beforeProps.left + width >= window.innerWidth) {
            result.left = position.left - width;
          }

          setIsMounted(true);
        } else {
          if (beforeProps.left + width >= window.innerWidth) {
            result.left = position.left - width;
          }
        }
      }

      if (isMounted) {
        if (nextProps.top !== beforeProps.top) {
          if (nextProps.top + height >= window.innerHeight) {
            result.top = nextProps.top - height;
          }
        }

        if (nextProps.left !== beforeProps.left) {
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

  const handleClick = useCallback(
    (onClick: () => void) => {
      onClick();
      onContextMenuClose();
    },
    [onContextMenuClose],
  );

  return (
    <BasePortal container={portalRef}>
      <div
        className={cx('wrapper')}
        ref={wrapperRef}
        style={{ top: position.top, left: position.left }}
      >
        {menu &&
          menu.map((item, i) => (
            <div className={cx('inner')} key={i}>
              <div className={cx('item')} onClick={() => handleClick(item.onClick)}>
                {item.label}
              </div>
            </div>
          ))}
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
