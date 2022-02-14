import { FunctionComponent } from 'react';

import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { BaseModal } from 'components/Modal';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './DragZoneModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  cancelText: string;

  title: string;

  mainMessage: string;

  subMesaage: string;

  onCancel?: () => void;

  onClose: () => void;
}

const DragZoneModal: FunctionComponent<Props> = (props) => {
  const { cancelText, title, mainMessage, subMesaage, onCancel, onClose } = props;

  const handleCloseButtonClick = () => {
    onCancel && onCancel();
    onClose();
  };

  return (
    <BaseModal>
      <div className={cx('title')}>{title}</div>
      <div className={cx('content')}>
        <Html content={mainMessage} />
        <div className={cx('drag-zone-wrapper')}>
          <span>{subMesaage}</span>
          <IconWrapper className={cx('cloud-upload-icon')} icon={SvgPath.CloudUpload} hasFrame={false} />
          <div className={cx('select-files-wrapper')}>
            <span>Drag & Drop here</span>
            <span>or</span>
            <strong>Select files</strong>
          </div>
        </div>
      </div>
      <FilledButton className={cx('cancel-button')} onClick={handleCloseButtonClick}>
        {cancelText}
      </FilledButton>
    </BaseModal>
  );
};

export default DragZoneModal;
