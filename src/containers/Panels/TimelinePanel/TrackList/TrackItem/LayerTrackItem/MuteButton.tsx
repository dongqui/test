import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { LayerTrack } from 'types/TP/track';
import { muteLayerTrack } from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = Pick<LayerTrack, 'isMuted' | 'trackName'>;

const MuteButton: FunctionComponent<Props> = (props) => {
  const { isMuted, trackName } = props;
  const dispatch = useDispatch();

  const handleMuteButtonClick = useCallback(() => {
    dispatch(muteLayerTrack({ isMuted: !isMuted, trackName }));
  }, [dispatch, isMuted, trackName]);

  return (
    <IconWrapper
      className={cx('mute-icon')}
      icon={isMuted ? SvgPath.EyeClose : SvgPath.EyeOpen}
      onClick={handleMuteButtonClick}
    />
  );
};

export default MuteButton;
