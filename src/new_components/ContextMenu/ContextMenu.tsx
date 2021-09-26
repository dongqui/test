import _ from 'lodash';
import {
  FunctionComponent,
  memo,
  useEffect,
  useState,
  useCallback,
  useRef,
  useContext,
  useLayoutEffect,
  createContext,
  MutableRefObject,
} from 'react';
import { BasePortal } from 'components/Modal';
import classnames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classnames.bind(styles);

interface Props {
  top: number;
  left: number;
  menu: {
    label: string;
    children: any[];
    onClick: () => void;
  }[];
}

const ContextMenu: FunctionComponent<Props> = ({ menu, top, left }) => {
  const portal = document.getElementById('portal_contextmenu');
  const portalRef = useRef(portal);

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

      let resultPositionTop = top;
      let resultPositionLeft = left;

      if (!isMounted) {
        if (_.isEqual(topDiff, 0)) {
          if (beforeProps.top + height >= window.innerHeight) {
            resultPositionTop = position.top - height;
          }

          setIsMounted(true);
        } else {
          if (beforeProps.top + height >= window.innerHeight) {
            resultPositionTop = position.top - height;
          }
        }

        if (_.isEqual(leftDiff, 0)) {
          if (beforeProps.left + width >= window.innerWidth) {
            resultPositionLeft = position.left - width;
          }

          setIsMounted(true);
        } else {
          if (beforeProps.left + width >= window.innerWidth) {
            resultPositionLeft = position.left - width;
          }
        }
      }

      if (isMounted) {
        if (nextProps.top !== beforeProps.top) {
          if (nextProps.top + height >= window.innerHeight) {
            resultPositionTop = nextProps.top - height;
          }
        }

        if (nextProps.left !== beforeProps.left) {
          if (nextProps.left + width >= window.innerWidth) {
            resultPositionLeft = nextProps.left - width;
          }
        }
      }

      setPosition({
        top: resultPositionTop,
        left: resultPositionLeft,
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

const ContextMenuContext = createContext<any>({});

const ContextMenuProvider = memo(({ children }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});

  const handleOpen = ({ title, confirmText, onConfirm, menu, actionCallback, top, left }: any) => {
    setDialogOpen(true);
    setDialogConfig({ title, confirmText, onConfirm, menu, actionCallback, top, left });
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <ContextMenuContext.Provider value={{ handleOpen, handleClose }}>
      {dialogOpen && <ContextMenu {...dialogConfig} />}
      {children}
    </ContextMenuContext.Provider>
  );
});

const useContextMenu = () => {
  const { handleOpen, handleClose } = useContext(ContextMenuContext);

  // 특정 작업 전 ContextMenu을 Open하여 완료하기 까지 대기
  const onContextMenuOpen = ({ ...options }) => {
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
    });
  };

  // 특정 작업 후 ContextMenu을 Close하여 마무리
  const onContextMenuClose = () => {
    new Promise(() => {
      handleClose();
    });
  };

  return { onContextMenuOpen, onContextMenuClose };
};

export { ContextMenuProvider, useContextMenu };
export default ContextMenu;
