import { FunctionComponent, Fragment, MutableRefObject, createContext, useEffect, useState, useContext, useCallback, useRef } from 'react';
import { BasePortal } from 'components/Modal';
import { Overlay } from 'components/Overlay';
import { Html } from 'components/Typography';
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
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmColor?: string;
}

const BaseModal: FunctionComponent<Props> = ({ children, isOpen, title, message, confirmText, onConfirm, cancelText, onCancel, confirmColor }) => {
  const portalRef = useRef(document.getElementById('portal_modal')) as MutableRefObject<HTMLElement>;
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOutsideClose = () => {};

  const contentClasses = cx('content', {
    margin: !!confirmText,
  });

  const { onModalClose } = useBaseModal();

  const handleConfirm = useCallback(() => {
    if (onConfirm) {
      onConfirm();
    }

    onModalClose();
  }, [onConfirm, onModalClose]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }

    onModalClose();
  }, [onCancel, onModalClose]);

  const classes = cx('button', 'confirm', confirmColor);

  return (
    <BasePortal container={portalRef}>
      {isOpen && (
        <Fragment>
          <div className={cx('wrapper')} ref={modalRef}>
            <div className={cx('inner')} tabIndex={0}>
              <div className={cx('title')}>{title}</div>
              <div className={contentClasses}>
                <Html content={message} />
              </div>
              <div className={cx('buttons')}>
                {cancelText && (
                  <button className={cx('button', 'cancel')} onClick={handleCancel}>
                    {cancelText}
                  </button>
                )}
                {confirmText && (
                  <button className={classes} onClick={handleConfirm}>
                    {confirmText}
                  </button>
                )}
              </div>
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

  const handleOpen = ({ title, message, confirmText, onConfirm, actionCallback, cancelText, onCancel, confirmColor }: any) => {
    setDialogOpen(true);

    setDialogConfig({ title, message, confirmText, actionCallback, cancelText, onConfirm, onCancel, confirmColor });
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
    dialogConfig.onConfirm && dialogConfig.onConfirm();
    dialogConfig.actionCallback(true);
  };

  const handleCancel = () => {
    handleReset();
    dialogConfig.onCancel && dialogConfig.onCancel();
    dialogConfig.actionCallback(false);
  };

  return (
    <BaseModalContext.Provider value={{ handleOpen, handleClose }}>
      <BaseModal isOpen={dialogOpen} onConfirm={handleConfirm} onCancel={handleCancel} {...dialogConfig} />
      {children}
    </BaseModalContext.Provider>
  );
};

const useBaseModal = () => {
  const { handleOpen, handleClose } = useContext(BaseModalContext);

  // 특정 작업 전 Modal을 Open하여 완료하기 까지 대기
  const onModalOpen = ({ ...options }) =>
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
    });

  // 특정 작업 후 Modal을 Close하여 마무리
  const onModalClose = () =>
    new Promise(() => {
      handleClose();
    });

  const getConfirm = ({ onConfirm, onCancel, ...options }: any) =>
    new Promise((res) => {
      const handleConfirm = () => {
        onConfirm && onConfirm();
        res(true);
      };

      const handleCancel = () => {
        onCancel && onCancel();
        res(false);
      };

      handleOpen({ actionCallback: res, onConfirm: handleConfirm, onCancel: handleCancel, ...options });
    });

  return { getConfirm, onModalOpen, onModalClose };
};

export { BaseModalProvider, useBaseModal };
export default BaseModal;
