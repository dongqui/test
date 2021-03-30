import { ShootTrackType } from 'types';
import _ from 'lodash';

interface FnUpdateKeyframeToBase {
  track: ShootTrackType;
  time: number;
  values: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Base Layer 에 속하는 track 에 대해 특정 시점에 keyframe 을 추가/수정한 새로운 track 을 반환합니다.
 * 이때 track 의 times 내에 prop 으로 받은 time 이 속하는지 판단하고 (소수점 4자리 반올림 기준),
 * 판단 결과값이 참이면 키프레임 수정, 거짓이면 추가에 해당하는 동작을 수행합니다.
 *
 * @param track - target track
 * @param time - target time
 * @param values - 추가/수정 시 사용할 값 (x, y, z)
 *
 * @returns 키프레임이 추가/수정된 새로운 track
 *
 */
const fnUpdateKeyframeToBase = (props: FnUpdateKeyframeToBase): ShootTrackType => {
  const { track, time, values } = props;
  let newTimes = _.clone(track.times);
  let newValues = _.clone(track.values);
  let timeIndex = _.findIndex(track.times, (t) => _.round(t, 4) === _.round(time, 4));
  // 빈 배열인 경우
  if (newTimes.length === 0) {
    newTimes = [time];
    newValues = [values.x, values.y, values.z];
  } else {
    // 해당 time 이 track 의 times 내에 존재하지 않는 경우 (키프레임 추가에 해당)
    if (timeIndex === -1) {
      if (time > track.times[track.times.length - 1]) {
        // 기존 times 뒤에 키프레임 추가
        newTimes = [...newTimes, time];
        newValues = [...newValues, values.x, values.y, values.z];
      } else if (time < track.times[0]) {
        // 기존 times 앞에 키프레임 추가
        newTimes = [time, ...newTimes];
        newValues = [values.x, values.y, values.z, ...newValues];
      } else {
        // 기존 times 사이에 키프레임 추가
        timeIndex = _.findIndex(
          _.slice(track.times, 1),
          (t, idx) =>
            _.round(track.times[idx - 1], 4) < _.round(time, 4) && _.round(t, 4) > _.round(time, 4),
        );
        newTimes = [
          ..._.slice(newTimes, 0, timeIndex + 1),
          time,
          ..._.slice(newTimes, timeIndex + 1),
        ];
        newValues = [
          ..._.slice(newValues, 0, 3 * (timeIndex + 1)),
          values.x,
          values.y,
          values.z,
          ..._.slice(newValues, 3 * (timeIndex + 1)),
        ];
      }
      // 해당 time 이 track 의 times 내에 이미 존재하는 경우 (키프레임 수정에 해당)
    } else {
      newValues[timeIndex * 3] = values.x;
      newValues[timeIndex * 3 + 1] = values.y;
      newValues[timeIndex * 3 + 2] = values.z;
    }
  }
  return {
    name: track.name,
    times: newTimes,
    values: newValues,
    interpolation: track.interpolation,
    included: true,
  };
};

export default fnUpdateKeyframeToBase;
