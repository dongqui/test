import { FunctionComponent, useRef } from 'react';

import { IconWrapper, SvgPath } from 'components/Icon';
import OnboardingTooltip, { VideoModeOnboarding } from 'containers/Onboarding/OnboardingTooltip';
import { useSelector } from 'reducers';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  onSwitchAnimationMode: () => void;

  onSwitchVideoMode: () => void;
}

const ChangeModeButton: FunctionComponent<Props> = (props) => {
  const { onSwitchAnimationMode, onSwitchVideoMode } = props;

  const videoModeButtonRef = useRef<HTMLSpanElement>(null);

  const { mode } = useSelector((state) => state.modeSelection);

  return (
    <>
      <div className={cx('wrapper')}>
        <IconWrapper className={cx('icon', { selected: mode === 'animationMode' })} onClick={onSwitchAnimationMode} icon={SvgPath.TrackMode} />
        <OnboardingTooltip placement="bottom-end" targetRef={videoModeButtonRef} content={<VideoModeOnboarding />}>
          <IconWrapper className={cx('icon', { selected: mode === 'videoMode' })} innerRef={videoModeButtonRef} onClick={onSwitchVideoMode} icon={SvgPath.Camera} />
        </OnboardingTooltip>
      </div>
    </>
  );
};

export default ChangeModeButton;
