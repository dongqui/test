import { FunctionComponent } from 'react';

import { PropertyIdentifier } from 'types/TP';
import { TimeEditorTrack } from 'types/TP/keyframe';
import { PropertyTrack } from 'types/TP/track';

import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends TimeEditorTrack<PropertyIdentifier>, PropertyTrack {
  translateY: number;
}

const TransformTrackComponent: FunctionComponent<Props> = (props) => {
  const { keyframes, isSelected, translateY, trackNumber } = props;

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
              trackType="property"
              trackNumber={trackNumber}
              {...keyframe}
            />
          ),
      )}
    </g>
  );
};

export default TransformTrackComponent;
