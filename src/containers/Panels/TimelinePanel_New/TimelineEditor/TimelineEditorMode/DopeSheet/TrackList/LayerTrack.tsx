import { useMemo, Fragment, FunctionComponent } from 'react';

import { LayerTrack } from 'types/TP_New/track';
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
  const { isPointedDownCaret, isSelected, translateY } = props;
  const layerKeyframes = useSelector((state) => state.keyframes.layerKeyframes);
  const boneKeyframes = useSelector((state) => state.keyframes.boneKeyframes);
  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  // bone 트랙들의 y값 계산
  const boneTranslateY = useMemo(() => {
    const result = Array(boneTrackList.length)
      .fill(1)
      .map((_, index) => index * 24 + 32 + translateY);
    let caretDownCount = 0;
    for (let index = 1; index < boneTrackList.length; index++) {
      if (boneTrackList[index - 1].isPointedDownCaret) caretDownCount += 24 * 9;
      result[index] += caretDownCount;
    }
    return result;
  }, [boneTrackList, translateY]);

  return (
    <Fragment>
      <g className={cx('track')} transform={`translate(0, ${translateY})`}>
        <rect
          className={cx({ selected: isSelected })}
          height="32"
          width="150000"
          transform="translate(-5000 0)"
        />
        {isSelected &&
          layerKeyframes.keyframes.map((keyframe) => (
            <Keyframe key={keyframe.timeIndex} isLayerKeyframe {...keyframe} />
          ))}
      </g>
      {isPointedDownCaret &&
        isSelected &&
        boneTrackList.map((boneTrack, index) => (
          <BoneTrack
            key={boneTrack.boneIndex}
            translateY={boneTranslateY[index]}
            {...boneTrack}
            {...boneKeyframes[index]}
          />
        ))}
    </Fragment>
  );
};

export default LayerTrackComponent;
