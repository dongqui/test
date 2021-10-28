import { FunctionComponent } from 'react';

import { EditorTrack } from 'types/TP_New/keyframe';
import { TransformTrack } from 'types/TP_New/track';

import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends EditorTrack, TransformTrack {
  translateY: number;
}

const TransformTrackComponent: FunctionComponent<Props> = (props) => {
  const { keyframes, isSelected, translateY, trackNumber, trackId } = props;

  return (
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
              trackType="transform"
              trackNumber={trackNumber}
              trackId={trackId}
              {...keyframe}
            />
          ),
      )}
    </g>
  );
};

export default TransformTrackComponent;
