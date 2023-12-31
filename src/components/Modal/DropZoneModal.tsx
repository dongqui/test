import React, { FunctionComponent, useCallback } from 'react';

import { IconWrapper, SvgPath } from 'components/Icon';
import { BaseModal } from 'components/Modal';
import { Typography } from 'components/Typography';
import { IconButton, OutlineButton } from 'components/Button';
import { BaseDropzone } from 'components/Input/Dropzone';

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
   * 모달 종료 이벤트
   */
  onClose: () => void;

  /**
   * 드래그 존에 드랍 이벤트
   */
  onDrop: (files: File[]) => void;
}

const DropZoneModal: FunctionComponent<React.PropsWithChildren<Props>> = ({ title, subTitle, onClose, onDrop }) => {
  const dropHandler = useCallback(
    (files: File[]) => {
      onClose();
      onDrop(files);
    },
    [onClose, onDrop],
  );

  return (
    <BaseModal className={cx('base-wrapper')}>
      <Typography type="title" className={cx('title')}>
        {title}
      </Typography>
      <div className={cx('content')}>
        <Typography type="body" className={cx('subTitle')}>
          {subTitle}
        </Typography>
        <div className={cx('dropzone')}>
          <BaseDropzone onDrop={dropHandler} className={cx('dropzone-outer')} active={cx('dropzone-active')}>
            {({ open }) => (
              <div className={cx('dropzone-guide')} onClick={open}>
                <IconWrapper className={cx('icon-plus')} icon={SvgPath.Plus} />
                <div className={cx('dropzone-guide-text')}>
                  Drag and drop <br />
                  or
                </div>
                <OutlineButton>Browse File</OutlineButton>
              </div>
            )}
          </BaseDropzone>
          <IconButton icon={SvgPath.Close} onClick={onClose} type="ghost" className={cx('dropzone-button')} />
        </div>
      </div>
    </BaseModal>
  );
};

export default DropZoneModal;
