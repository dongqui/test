import { useCallback, FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { LayerTrack } from 'types/TP/track';
import * as trackListActions from 'actions/trackList';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

type Props = Pick<LayerTrack, 'isMuted' | 'trackName' | 'trackId'>;

const MuteButton: FunctionComponent<Props> = (props) => {
  const { isMuted, trackName, trackId } = props;
  const dispatch = useDispatch();

  const handleMuteButtonClick = useCallback(() => {
    dispatch(trackListActions.clickLayerTrackMuteButton({ id: trackId, name: trackName }));
  }, [dispatch, trackId, trackName]);

  return <IconWrapper className={cx('mute-icon')} icon={isMuted ? SvgPath.EyeClose : SvgPath.EyeOpen} onClick={handleMuteButtonClick} />;
};

export default MuteButton;
