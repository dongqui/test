import { FunctionComponent, Fragment, memo, createContext, useContext, useState } from 'react';
import { BaseModal } from 'components/Modal';
import { FilledButton } from 'components/Button';
import classnames from 'classnames/bind';
import styles from './ConfirmModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  isOpen?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onOutsideClose?: () => void;
  title: string;
  text: {
    confirm: string;
    cancel: string;
  };
}

const ConfirmModal: FunctionComponent<Props> = ({ isOpen, title, text, onClose, onConfirm, onOutsideClose }) => {
  return (
    <Fragment>
      {isOpen && (
        <BaseModal onClose={onClose} onOutsideClose={onOutsideClose} title={title}>
          <div className={cx('inner')}>
            <FilledButton className={cx('button-cancel')} onClick={onClose} color="secondary" fullSize>
              {text.cancel}
            </FilledButton>
            <FilledButton onClick={onConfirm} color="primary" fullSize>
              {text.confirm}
            </FilledButton>
          </div>
        </BaseModal>
      )}
    </Fragment>
  );
};

const ConfirmModalContext = createContext<any>({});

const ConfirmModalProvider = ({ children }: any) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});
  const [text, setText] = useState({ confirm: 'OK', cancel: 'Cancel' });

  const handleOpen = ({ title, message, actionCallback }: any) => {
    setDialogOpen(true);
    setDialogConfig({ title, message, actionCallback });
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

  const handleText = ({ text: { confirm, cancel } }: any) => {
    setText({ confirm, cancel });
  };

  return (
    <ConfirmModalContext.Provider value={{ handleOpen, handleText }}>
      <ConfirmModal isOpen={dialogOpen} title={dialogConfig?.title} onConfirm={handleConfirm} onClose={handleDismiss} text={{ confirm: text.confirm, cancel: text.cancel }} />
      {children}
    </ConfirmModalContext.Provider>
  );
};

const useConfirmModal = () => {
  const { handleOpen, handleText } = useContext(ConfirmModalContext);

  const getConfirm = ({ ...options }) =>
    new Promise((res) => {
      handleOpen({ actionCallback: res, ...options });
      if (options?.text) {
        handleText({ ...options });
      }
    });

  return { getConfirm };
};

export { ConfirmModalProvider, useConfirmModal };
export default memo(ConfirmModal);
