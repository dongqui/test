import _ from 'lodash';
import {
  FunctionComponent,
  Fragment,
  memo,
  useEffect,
  useState,
  useRef,
  useContext,
  useMemo,
  useLayoutEffect,
  createContext,
  MutableRefObject,
  RefObject,
} from 'react';
import { BasePortal } from 'components/Modal';
import classnames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classnames.bind(styles);

const getNumberValue = (targetValue: string): number => {
  const startUnitIndex = targetValue.indexOf('px');
  const resultValue = Number(targetValue.substr(0, startUnitIndex));

  return resultValue;
};

interface Props {
  top: number;
  left: number;
  isOpen?: boolean;
  message?: string;
  menu: {
    label: string;
    children: {
      label: string;
      onClick: () => void;
    }[];
    onClick: () => void;
  }[];
}

const ContextMenu: FunctionComponent<Props> = ({ isOpen, menu, top, left }) => {
  const portalRef = useRef(
    document.getElementById('portal_contextmenu'),
  ) as MutableRefObject<HTMLElement>;

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onContextMenuClose } = useContextMenu();

  const [injectedPosition, setInjectedPosition] = useState({
    top: top,
    left: left,
  });

  const [isMounted, setIsMounted] = useState(false);

  useLayoutEffect(() => {
    const currentRef = wrapperRef?.current;

    if (currentRef) {
      const { width, height } = currentRef.getBoundingClientRect();

      const numberValue = {
        nextPropsTop: top,
        nextPropsLeft: left,
        beforeStateTop: injectedPosition.top,
        beforeStateLeft: injectedPosition.left,
      };

      const topDiff = Math.abs(numberValue.nextPropsTop - numberValue.beforeStateTop);
      const leftDiff = Math.abs(numberValue.nextPropsLeft - numberValue.beforeStateLeft);

      let resultPositionTop = top;
      let resultPositionLeft = left;

      if (!isMounted) {
        if (_.isEqual(topDiff, 0)) {
          if (numberValue.beforeStateTop + height >= window.innerHeight) {
            resultPositionTop = injectedPosition.top - height;
          }

          setIsMounted(true);
        } else {
          if (numberValue.beforeStateTop + height >= window.innerHeight) {
            resultPositionTop = injectedPosition.top - height;
          }
        }

        if (_.isEqual(leftDiff, 0)) {
          if (numberValue.beforeStateLeft + width >= window.innerWidth) {
            resultPositionLeft = injectedPosition.left - width;
          }

          setIsMounted(true);
        } else {
          if (numberValue.beforeStateLeft + width >= window.innerWidth) {
            resultPositionLeft = injectedPosition.left - width;
          }
        }
      }

      if (isMounted) {
        if (numberValue.nextPropsTop !== numberValue.beforeStateTop) {
          if (numberValue.nextPropsTop + height >= window.innerHeight) {
            resultPositionTop = numberValue.nextPropsTop - height;
          }
        }

        if (numberValue.nextPropsLeft !== numberValue.beforeStateLeft) {
          if (numberValue.nextPropsLeft + width >= window.innerWidth) {
            resultPositionLeft = numberValue.nextPropsLeft - width;
          }
        }
      }

      setInjectedPosition({
        top: resultPositionTop,
        left: resultPositionLeft,
      });
    }
  }, [injectedPosition.left, injectedPosition.top, , isMounted, left, top]);

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

  const [showsCasecading, setShowsCascading] = useState(false);

  const handleMouseEnter = () => {
    const hoverEvent = setTimeout(() => {
      setShowsCascading(true);
      clearTimeout(hoverEvent);
    }, 1000);
  };

  return (
    <BasePortal container={portalRef}>
      {isOpen && (
        <div
          className={cx('wrapper')}
          ref={wrapperRef}
          style={{ top: injectedPosition.top, left: injectedPosition.left }}
        >
          {menu &&
            menu.map((item, i) => (
              <div className={cx('inner')} key={i}>
                <div className={cx('item')} onMouseEnter={handleMouseEnter}>
                  {item.label}
                </div>
                {showsCasecading && (
                  <div>
                    {item.children.map((sub, j) => (
                      <div key={j}>{sub.label}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
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

  const handleReset = () => {
    setDialogOpen(false);
    setDialogConfig({});
  };

  const handleConfirm = () => {
    handleReset();
    dialogConfig.actionCallback(true);
  };

  const handleDismiss = () => {
    handleReset();
    dialogConfig.actionCallback(false);
  };

  return (
    <ContextMenuContext.Provider value={{ handleOpen, handleClose }}>
      {dialogOpen && <ContextMenu isOpen={dialogOpen} {...dialogConfig} />}
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

  const getConfirm = ({ ...options }) => {
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
    });
  };

  return { getConfirm, onContextMenuOpen, onContextMenuClose };
};

export { ContextMenuProvider, useContextMenu };
export default ContextMenu;
