import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { LayerTrack } from 'types/TP/track';
import { useSelector } from 'reducers';
import * as trackListActions from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';
import { forceClickAnimationPauseAndPlay } from 'utils/common';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = Pick<LayerTrack, 'isMuted' | 'trackName' | 'trackId'>;

const MuteButton: FunctionComponent<Props> = (props) => {
  const { isMuted, trackName, trackId } = props;
  const dispatch = useDispatch();

  const _playDirection = useSelector((state) => state.animatingControls.playDirection);
  const _playState = useSelector((state) => state.animatingControls.playState);

  const handleMuteButtonClick = useCallback(() => {
    dispatch(trackListActions.clickLayerTrackMuteButton({ id: trackId, name: trackName }));
    forceClickAnimationPauseAndPlay(_playState, _playDirection);
  }, [_playDirection, _playState, trackId, trackName, dispatch]);

  return <IconWrapper className={cx('mute-icon')} icon={isMuted ? SvgPath.EyeClose : SvgPath.EyeOpen} onClick={handleMuteButtonClick} />;
};

export default MuteButton;
