import { useMemo, Fragment, FunctionComponent } from 'react';

import { TimeEditorTrack } from 'types/TP/keyframe';
import { BoneTrack } from 'types/TP/track';
import { PropertyTrack as PropertyTrackAlias } from 'types/TP/track';
import { useSelector } from 'reducers';
import { getBoneTrackIndex } from 'utils/TP';

import { PropertyTrack } from './index';
import Keyframe from './Keyframe';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';

const cx = classNames.bind(styles);

interface Props extends TimeEditorTrack, BoneTrack {
  translateY: number;
}

const BoneTrackComponent: FunctionComponent<Props> = (props) => {
  const { trackNumber, trackId, keyframes, isPointedDownCaret, isSelected, translateY } = props;
  const propertyKeyframes = useSelector((state) => state.keyframes.propertyTrackList);
  const propertyTrackList = useSelector((state) => state.trackList.propertyTrackList);

  // 자식이 될 property 키프레임 필터링
  const childrenKeyframes = useMemo(() => {
    let index = 0;
    return findChildrenTracks(trackNumber, propertyKeyframes) as TimeEditorTrack[];
  }, [trackNumber, propertyKeyframes]);

  // 자식이 될 property 트랙 리스트 필터링
  const childrenTrackList = useMemo(() => {
    return findChildrenTracks(trackNumber, propertyTrackList) as PropertyTrackAlias[];
  }, [trackNumber, propertyTrackList]);

  return (
    <Fragment>
      <g className={cx('track')} transform={`translate(0, ${translateY})`}>
        <rect className={cx({ selected: isSelected })} height="24" width="200000" transform="translate(-5000 0)" />
        {keyframes.map(
          (keyframe) =>
            !keyframe.isDeleted && <Keyframe key={`${keyframe.time}_${keyframe.isSelected}`} trackId={trackId} trackType="bone" trackNumber={trackNumber} {...keyframe} />,
        )}
        <line x1="-5000" y1="24" x2="150000" y2="24" strokeWidth="1" />
      </g>
      {isPointedDownCaret &&
        childrenTrackList.map((propertyTrack, index) => (
          <PropertyTrack key={propertyTrack.trackNumber} translateY={translateY + (index + 1) * 24} {...propertyTrack} {...childrenKeyframes[index]} />
        ))}
    </Fragment>
  );
};

export default BoneTrackComponent;
