import React, { useRef, FunctionComponent } from 'react';
import { useDropzone } from 'react-dropzone';

import { FilledButton } from 'components/Button';
import { IconWrapper, SvgPath } from 'components/Icon';
import { BaseModal } from 'components/Modal';
import { Html } from 'components/Typography';

import classnames from 'classnames/bind';
import styles from './DropZoneModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  /**
   * 모달의 제목
   */
  title: string;

  /**
   * 모달의 부제목
   */
  subTitle: string;

  /**
   * 확장자 지원을 알려주는 메시지
   */
  extensionMesaage: string;

  /**
   * 취소 버튼 메시지
   */
  cancelButtonText: string;

  /**
   * 모달 취소 이벤트
   */
  onCancel?: () => void;

  /**
   * 모달 종료 이벤트
   */
  onClose: () => void;

  /**
   * 드래그 존에 드랍 이벤트
   */
  onDrop: (files: File[]) => void;
}

const DropZoneModal: FunctionComponent<Props> = (props) => {
  const { cancelButtonText, title, subTitle, extensionMesaage, onCancel, onClose, onDrop } = props;

  const { getRootProps } = useDropzone({
    onDrop: (files) => {
      onDrop(files);
      onClose();
    },
    noClick: true,
  });

  const fileExplorerRef = useRef<HTMLInputElement>(null);

  // input file 변경
  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files !== null) {
      const files = Array.from(e.target.files);
      e.target.value = '';
      onDrop(files);
      onClose();
    }
  };

  // Select Files 텍스트 클릭
  const handleSelectFilesClick = () => {
    if (fileExplorerRef.current) {
      fileExplorerRef.current.click();
    }
  };

  // 취소 버튼 클릭
  const handleCloseButtonClick = () => {
    onCancel && onCancel();
    onClose();
  };

  return (
    <BaseModal>
      <h3 className={cx('title')}>{title}</h3>
      <div className={cx('content')}>
        <Html content={subTitle} />
        <div className={cx('drop-zone-wrapper')} {...getRootProps()}>
          <span>{extensionMesaage}</span>
          <IconWrapper className={cx('cloud-upload-icon')} icon={SvgPath.CloudUpload} hasFrame={false} />
          <div className={cx('select-files-wrapper')}>
            <span>Drag & Drop here</span>
            <span>or</span>
            <strong onClick={handleSelectFilesClick}>Select files</strong>
            <input type="file" multiple ref={fileExplorerRef} onChange={handleInputFileChange} />
          </div>
        </div>
      </div>
      <FilledButton className={cx('cancel-button')} onClick={handleCloseButtonClick}>
        {cancelButtonText}
      </FilledButton>
    </BaseModal>
  );
};

export default DropZoneModal;
