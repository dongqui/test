import { useMemo, Fragment, FunctionComponent } from 'react';

import { EditorTrack } from 'types/TP_New/keyframe';
import { BoneTrack } from 'types/TP_New/track';
import { useSelector } from 'reducers';
import { getBoneTrackIndex } from 'utils/TP';

import { TransformTrack } from './index';
import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends EditorTrack, BoneTrack {
  translateY: number;
}

const BoneTrackComponent: FunctionComponent<Props> = (props) => {
  const { trackId, trackNumber, keyframes, isPointedDownCaret, isSelected, translateY } = props;
  const transformKeyframes = useSelector((state) => state.keyframes.transformKeyframes);
  const transformTrackList = useSelector((state) => state.trackList.transformTrackList);

  // 자식이 될 transform 키프레임 필터링
  const childrenKeyframes = useMemo(() => {
    let index = 0;
    while (index < transformKeyframes.length) {
      const boneIndex = getBoneTrackIndex(transformKeyframes[index].trackNumber as number);
      if (boneIndex === trackNumber) {
        const start = index - 1 === -1 ? 0 : index;
        return transformKeyframes.slice(start, index + 3);
      }
      index += 3;
    }
    return [];
  }, [trackNumber, transformKeyframes]);

  // 자식이 될 transform 트랙 리스트 필터링
  const childrenTrackList = useMemo(() => {
    let index = 0;
    while (index < transformTrackList.length) {
      const boneIndex = getBoneTrackIndex(transformTrackList[index].trackNumber);
      if (boneIndex === trackNumber) {
        const start = index - 1 === -1 ? 0 : index;
        return transformTrackList.slice(start, index + 3);
      }
      index += 3;
    }
    return [];
  }, [trackNumber, transformTrackList]);

  return (
    <Fragment>
      <g className={cx('track')} transform={`translate(0, ${translateY})`}>
        <rect
          className={cx({ selected: isSelected })}
          height="24"
          width="150000"
          transform="translate(-5000 0)"
        />
        {keyframes.map(
          (keyframe) =>
            !keyframe.isDeleted && (
              <Keyframe
                key={keyframe.time}
                trackId={trackId}
                trackType="bone"
                trackNumber={trackNumber}
                {...keyframe}
              />
            ),
        )}
      </g>
      {isPointedDownCaret &&
        childrenTrackList.map((transformTrack, index) => (
          <TransformTrack
            key={transformTrack.trackNumber}
            translateY={translateY + (index + 1) * 24}
            {...transformTrack}
            {...childrenKeyframes[index]}
          />
        ))}
    </Fragment>
  );
};

export default BoneTrackComponent;
