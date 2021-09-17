import {
  FunctionComponent,
  useEffect,
  useState,
  useRef,
  useContext,
  createContext,
  MutableRefObject,
  RefObject,
} from 'react';
import { BasePortal } from 'components/Modal';
import classnames from 'classnames/bind';
import styles from './ContextMenu.module.scss';

const cx = classnames.bind(styles);

interface Props {
  innerRef: RefObject<HTMLElement>;
  isOpen?: boolean;
  message?: string;
}

const ContextMenu: FunctionComponent<Props> = ({ innerRef, isOpen, message }) => {
  const portalRef = useRef(
    document.getElementById('portal_contextmenu'),
  ) as MutableRefObject<HTMLElement>;

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { onContextMenuClose } = useContextMenu();

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
      {isOpen && (
        <div className={cx('wrapper')} ref={wrapperRef}>
          {message}
        </div>
      )}
    </BasePortal>
  );
};

const ContextMenuContext = createContext<any>({});

const ContextMenuProvider = ({ children }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});

  const handleOpen = ({ title, message, confirmText, onConfirm, actionCallback }: any) => {
    setDialogOpen(true);
    setDialogConfig({ title, message, confirmText, onConfirm, actionCallback });
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
      <ContextMenu isOpen={dialogOpen} {...dialogConfig} />
      {children}
    </ContextMenuContext.Provider>
  );
};

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
