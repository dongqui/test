import { FunctionComponent, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';

import * as globalUIActions from 'actions/Common/globalUI';
import OnboardingTooltip, { ImportFileOnboarding } from 'containers/Onboarding/OnboardingTooltip';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './LPHeader.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onLoad: (files: File[]) => void;
}

const LPHeader: FunctionComponent<Props> = ({ onLoad }) => {
  const dispatch = useDispatch();

  const importButtonRef = useRef<HTMLSpanElement>(null);

  // file import 버튼 클릭
  const handleFileImportButtonClick = useCallback(() => {
    dispatch(
      globalUIActions.openModal('DragZoneModal', {
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
      <div className={cx('explorer')}>
        <OnboardingTooltip placement="right-start" targetRef={importButtonRef} content={<ImportFileOnboarding />}>
          <IconWrapper className={cx('icon')} icon={SvgPath.Plus} hasFrame={false} innerRef={importButtonRef} onClick={handleFileImportButtonClick} />
        </OnboardingTooltip>
      </div>
    </div>
  );
};

export default LPHeader;
