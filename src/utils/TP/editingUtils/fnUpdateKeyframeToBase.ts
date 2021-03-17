import _ from 'lodash';

type Track = {
  name: string;
  times: number[];
  values: number[];
  interpolation: string;
};

interface FnUpdateKeyframeToBase {
  track: Track;
  time: number;
  values: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * Base Layer 에 속하는 track 에 대해 keyframe 을 추가/수정한 새로운 track 을 반환합니다.
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
const fnUpdateKeyframeToBase = (props: FnUpdateKeyframeToBase) => {
  const { track, time, values } = props;
  const newTimes = _.clone(track.times);
  const newValues = _.clone(track.values);
  let timeIndex = _.findIndex(track.times, (t) => _.round(t, 4) === _.round(time, 4));

  // 해당 time 이 track 의 times 내에 존재하지 않는 경우 (키프레임 추가에 해당)
  if (timeIndex === -1) {
    if (time > track.times[track.times.length - 1]) {
      // 추가되는 time 이 duration 보다 뒤일 때
    } else if (time < track.times[0]) {
      // 추가되는 time 이 첫 번째 time 보다 앞일 때
    } else {
      // 추가되는 time 이 times 내에 속할 때
      timeIndex = _.findIndex(
        _.slice(track.times, 1),
        (t, idx) =>
          _.round(track.times[idx - 1], 4) < _.round(time, 4) && _.round(t, 4) > _.round(time, 4),
      );
    }
    // 해당 time 이 track 의 times 내에 존재하는 경우 (키프레임 수정에 해당)
  } else {
    newValues[timeIndex * 3] = values.x;
    newValues[timeIndex * 3 + 1] = values.y;
    newValues[timeIndex * 3 + 2] = values.z;
  }
  return {
    name: track.name,
    times: newTimes,
    values: newValues,
    interpolation: track.interpolation,
  };
};

export default fnUpdateKeyframeToBase;
