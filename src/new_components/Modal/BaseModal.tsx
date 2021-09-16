import {
  FunctionComponent,
  Fragment,
  MutableRefObject,
  createContext,
  useState,
  useContext,
  useRef,
} from 'react';
import { BasePortal } from 'components/Modal';
import { Overlay } from 'components/Overlay';
import classnames from 'classnames/bind';
import styles from './BaseModal.module.scss';

const cx = classnames.bind(styles);

const focusableList = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[tabindex="0"]',
  '[contenteditable]',
];

interface Props {
  onOutsideClose?: () => void;
  isOpen?: boolean;
  title: string;
  message: string;
}

const BaseModal: FunctionComponent<Props> = ({ children, isOpen, title, message }) => {
  const portalRef = useRef(document.getElementById('portal')) as MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClose = () => {};

  return (
    <BasePortal container={portalRef}>
      {isOpen && (
        <Fragment>
          <div className={cx('wrapper')} ref={modalRef}>
            <div className={cx('inner')} tabIndex={0}>
              <div className={cx('title')}>{title}</div>
              <div className={cx('content')}>{message}</div>
              {children}
            </div>
            <Overlay onClose={handleOutsideClose} />
          </div>
        </Fragment>
      )}
    </BasePortal>
  );
};

const BaseModalContext = createContext<any>({});

const BaseModalProvider = ({ children }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});

  const handleOpen = ({ title, message, actionCallback, ...rest }: any) => {
    setDialogOpen(true);
    setDialogConfig({ title, message, actionCallback });
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
    <BaseModalContext.Provider value={{ handleOpen, handleClose }}>
      <BaseModal isOpen={dialogOpen} title={dialogConfig.title} message={dialogConfig.message} />
      {children}
    </BaseModalContext.Provider>
  );
};

const useBaseModal = () => {
  const { handleOpen, handleClose } = useContext(BaseModalContext);

  // 특정 작업 전 Modal을 Open하여 완료하기 까지 대기
  const onModalOpen = ({ ...options }) => {
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
    });
  };

  // 특정 작업 후 Modal을 Close하여 마무리
  const onModalClose = () => {
    new Promise(() => {
      handleClose();
    });
  };

  const getConfirm = ({ ...options }) =>
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
    });

  return { getConfirm, onModalOpen, onModalClose };
};

export { BaseModalProvider, useBaseModal };
export default BaseModal;
