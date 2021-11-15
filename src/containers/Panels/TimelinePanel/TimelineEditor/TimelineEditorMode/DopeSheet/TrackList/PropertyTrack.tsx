import { FunctionComponent } from 'react';

import { TimeEditorTrack } from 'types/TP/keyframe';
import { PropertyTrack } from 'types/TP/track';

import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props extends TimeEditorTrack, PropertyTrack {
  translateY: number;
}

const TransformTrackComponent: FunctionComponent<Props> = (props) => {
  const { trackId, keyframes, isSelected, translateY, trackNumber } = props;

  return (
    <g className={cx('track')} transform={`translate(0, ${translateY})`}>
      <rect className={cx({ selected: isSelected })} height="24" width="150000" transform="translate(-5000 0)" />
      {keyframes.map(
        (keyframe) =>
          !keyframe.isDeleted && <Keyframe key={`${keyframe.time}_${keyframe.isSelected}`} trackId={trackId} trackType="property" trackNumber={trackNumber} {...keyframe} />,
      )}
    </g>
  );
};

export default TransformTrackComponent;
