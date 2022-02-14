import { FunctionComponent, useCallback, ChangeEvent } from 'react';
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

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files !== null) {
        const files = Array.from(e.target.files);
        e.target.value = '';

        onLoad(files);
      }
    },
    [onLoad],
  );

  // file import 버튼 클릭
  const handleFileImportButtonClick = useCallback(() => {
    dispatch(
      globalUIActions.openModal('DragZoneModal', {
        title: 'Import',
        mainMessage: 'Import your 3D assets or source videos',
        subMesaage: '.fbx, .glb, .mp4, .mov, .avi, .webm supported',
        cancelText: 'Cancel',
      }),
    );
  }, [dispatch]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>library</div>
      <div className={cx('explorer')}>
        <IconWrapper className={cx('icon')} icon={SvgPath.Plus} hasFrame={false} onClick={handleFileImportButtonClick} />
        {/* <label htmlFor="file-explorer" />
        <input type="file" multiple id="file-explorer" onChange={handleChange} /> */}
      </div>
    </div>
  );
};

export default LPHeader;
