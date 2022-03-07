import { FunctionComponent } from 'react';

import { IconWrapper, SvgPath } from 'components/Icon';
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

  const { mode } = useSelector((state) => state.modeSelection);

  return (
    <>
      <div className={cx('wrapper')}>
        <IconWrapper className={cx('icon', { selected: mode === 'animationMode' })} onClick={onSwitchAnimationMode} icon={SvgPath.TrackMode} />
        <IconWrapper className={cx('icon', { selected: mode === 'videoMode' })} onClick={onSwitchVideoMode} icon={SvgPath.Camera} />
      </div>
    </>
  );
};

export default ChangeModeButton;
