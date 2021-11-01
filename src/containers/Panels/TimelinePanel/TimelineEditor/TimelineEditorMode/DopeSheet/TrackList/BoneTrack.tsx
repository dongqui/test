import { useMemo, Fragment, FunctionComponent } from 'react';

import { BoneIdentifier } from 'types/TP';
import { TimeEditorTrack } from 'types/TP/keyframe';
import { BoneTrack } from 'types/TP/track';
import { useSelector } from 'reducers';
import { getBoneTrackIndex } from 'utils/TP';

import { PropertyTrack } from './index';
import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends TimeEditorTrack<BoneIdentifier>, BoneTrack {
  translateY: number;
}

const BoneTrackComponent: FunctionComponent<Props> = (props) => {
  const { trackNumber, keyframes, isPointedDownCaret, isSelected, translateY } = props;
  const propertyKeyframes = useSelector((state) => state.keyframes.propertyTrackList);
  const propertyTrackList = useSelector((state) => state.trackList.propertyTrackList);

  // 자식이 될 property 키프레임 필터링
  const childrenKeyframes = useMemo(() => {
    let index = 0;
    while (index < propertyKeyframes.length) {
      const boneIndex = getBoneTrackIndex(propertyKeyframes[index].trackNumber as number);
      if (boneIndex === trackNumber) {
        const start = index - 1 === -1 ? 0 : index;
        return propertyKeyframes.slice(start, index + 3);
      }
      index += 3;
    }
    return [];
  }, [trackNumber, propertyKeyframes]);

  // 자식이 될 property 트랙 리스트 필터링
  const childrenTrackList = useMemo(() => {
    let index = 0;
    while (index < propertyTrackList.length) {
      const boneIndex = getBoneTrackIndex(propertyTrackList[index].trackNumber);
      if (boneIndex === trackNumber) {
        const start = index - 1 === -1 ? 0 : index;
        return propertyTrackList.slice(start, index + 3);
      }
      index += 3;
    }
    return [];
  }, [trackNumber, propertyTrackList]);

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
                trackType="bone"
                trackNumber={trackNumber}
                {...keyframe}
              />
            ),
        )}
      </g>
      {isPointedDownCaret &&
        childrenTrackList.map((propertyTrack, index) => (
          <PropertyTrack
            key={propertyTrack.trackNumber}
            translateY={translateY + (index + 1) * 24}
            {...propertyTrack}
            {...childrenKeyframes[index]}
          />
        ))}
    </Fragment>
  );
};

export default BoneTrackComponent;
