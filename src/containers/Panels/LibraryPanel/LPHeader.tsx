import { FunctionComponent, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import { SvgPath } from 'components/Icon';
import { IconButton } from 'components/Button';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './LPHeader.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onLoad: (files: File[]) => void;
}

const LPHeader: FunctionComponent<Props> = ({ onLoad }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(globalUIActions.openModal('UpgradePlanModal', { hadFreeTrial: true }));
  }, []);

  // file import 버튼 클릭
  const handleFileImportButtonClick = useCallback(() => {
    dispatch(
      globalUIActions.openModal('DropZoneModal', {
        title: 'Import',
        subTitle: 'Import your 3D asset or source video.',
        onDrop: onLoad,
      }),
    );
  }, [dispatch, onLoad]);

  return (
    <div className={cx('wrapper')}>
      <div className={cx('title')}>library</div>
      <IconButton icon={SvgPath.Plus} type="ghost" id={ONBOARDING_ID.IMPORT_FILE} onClick={handleFileImportButtonClick} />
    </div>
  );
};

export default LPHeader;
