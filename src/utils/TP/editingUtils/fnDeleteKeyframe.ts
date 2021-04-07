import { ShootTrackType } from 'types';
import _ from 'lodash';

interface FnDeleteKeyframe {
  track: ShootTrackType;
  time: number;
}

/**
 * prop 으로 받은 track 에서 특정 시점의 키프레임을 제거한 track 을 반환합니다.
 *
 * @param track - target track
 * @param time - target time
 *
 * @returns 키프레임이 삭제된 새로운 track
 *
 */
const fnDeleteKeyframe = (props: FnDeleteKeyframe): ShootTrackType => {
  const { track, time } = props;
  let newTimes = _.clone(track.times);
  let newValues = _.clone(track.values);
  const timeIndex = _.findIndex(track.times, (t) => _.round(t, 4) === _.round(time, 4));
  if (timeIndex === -1) {
    // 해당 time 이 track 의 times 내에 존재하지 않는다면 그냥 원래 track 을 return
    return track;
  } else {
    if (timeIndex === 0) {
      newTimes = _.slice(newTimes, 1);
      newValues = _.slice(newValues, 3);
    } else if (timeIndex === track.times.length - 1) {
      newTimes = _.slice(newTimes, 0, track.times.length - 1);
      newValues = _.slice(newValues, 0, track.times.length - 3);
    } else {
      newTimes = [..._.slice(newTimes, 0, timeIndex), ..._.slice(newTimes, timeIndex + 1)];
      newValues = [
        ..._.slice(newValues, 0, 3 * timeIndex),
        ..._.slice(newValues, 3 * (timeIndex + 1)),
      ];
    }
  }
  return {
    name: track.name,
    times: newTimes,
    values: newValues,
    interpolation: track.interpolation,
    isIncluded: true,
  };
};

export default fnDeleteKeyframe;
