import { useMemo, Fragment, FunctionComponent } from 'react';

import { LayerTrack } from 'types/TP/track';
import { useSelector } from 'reducers';

import { BoneTrack } from './index';
import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends LayerTrack {
  translateY: number;
}

const LayerTrackComponent: FunctionComponent<Props> = (props) => {
  const { trackId, trackNumber, isPointedDownCaret, isSelected, translateY } = props;
  const layerKeyframes = useSelector((state) => state.keyframes.layerTrack);
  const boneKeyframes = useSelector((state) => state.keyframes.boneTrackList);
  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  // bone 트랙 translateY 계산
  const boneTranslateY = useMemo(() => {
    const result = Array(boneTrackList.length)
      .fill(1)
      .map((_, index) => index * 24 + 32 + translateY);
    let boneCaretDownCount = 0;
    for (let index = 1; index < boneTrackList.length; index++) {
      if (boneTrackList[index - 1].isPointedDownCaret) boneCaretDownCount += 24 * 3;
      result[index] += boneCaretDownCount;
    }
    return result;
  }, [boneTrackList, translateY]);

  return (
    <Fragment>
      <g className={cx('track')} transform={`translate(0, ${translateY})`}>
        <rect className={cx({ selected: isSelected })} height="32" width="200000" transform="translate(-5000 0)" />
        {isSelected &&
          layerKeyframes?.keyframes.map(
            (keyframe) =>
              !keyframe.isDeleted && <Keyframe key={`${keyframe.time}_${keyframe.isSelected}`} trackId={trackId} trackType="layer" trackNumber={trackNumber} {...keyframe} />,
          )}
        <line x1="-5000" y1="32" x2="150000" y2="32" strokeWidth="1" />
      </g>
      {isPointedDownCaret &&
        isSelected &&
        boneTrackList.map((boneTrack, index) => <BoneTrack key={boneTrack.trackNumber} translateY={boneTranslateY[index]} {...boneTrack} {...boneKeyframes[index]} />)}
    </Fragment>
  );
};

export default LayerTrackComponent;
