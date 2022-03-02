import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './LPHeader.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onLoad: (files: File[]) => void;
}

const LPHeader: FunctionComponent<Props> = ({ onLoad }) => {
  const dispatch = useDispatch();

  // file import 버튼 클릭
  const handleFileImportButtonClick = useCallback(() => {
    dispatch(
      globalUIActions.openModal('DropZoneModal', {
        title: 'Import',
        subTitle: 'Import your 3D assets or source videos',
        extensionMesaage: '.fbx, .glb, .mp4, .mov, .avi, .webm supported',
        cancelButtonText: 'Cancel',
        onDrop: onLoad,
      }),
    );
  }, [dispatch, onLoad]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>library</div>
      <IconWrapper className={cx('icon')} icon={SvgPath.Plus} hasFrame={false} onClick={handleFileImportButtonClick} />
    </div>
  );
};

export default LPHeader;
