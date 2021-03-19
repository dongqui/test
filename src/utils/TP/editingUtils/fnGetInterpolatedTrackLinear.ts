import { ShootTrackType } from 'interfaces';
import _ from 'lodash';

interface FnGetInterpolatedTrackLinear {
  targetTimes: number[];
  track: ShootTrackType;
}

/**
 * 기준 times 내 time 중 타겟 트랙이 value 를 가지고 있지 않은 시점에 대해 자체적인 linear 보간법을 통해 값을 채워준 track 을 반환합니다.
 * 이때 기준 times 는 각 Layer(summary 에 해당) 에서 해당 트랙이 갖는 times 들의 합집합 배열입니다.
 * 예를 들어, baseLayer 내 hips.position 의 times 가 [1, 1.5, 3] 이고, Layer1 내 hips.position 의 times 가 [1, 2, 3] 이라면,
 * 기준 times 는 [1, 1.5, 2, 3] 입니다.
 *
 * @param targetTimes - 기준 times
 * @param track - 보간 적용 대상 track
 *
 * @returns 자체적인 선형보간법을 적용한 새로운 track
 *
 */
const fnGetInterpolatedTrackLinear = (props: FnGetInterpolatedTrackLinear) => {
  const { targetTimes, track } = props;
  const newTimes = _.clone(targetTimes);
  const { times, values } = track;
  const newValues: number[] = [];

  // targetTimes 를 순회하며 보간을 적용한다.
  // 1. 먼저 track.times 가 시작되기 전의 시점에 대해서는 track.times[0] 값을 보간값으로 적용한다 v
  // 2. track.times 와 겹치는 구간에 대해서는 (track.times 의 마지막 값 제외) v
  //  1) track.times 에 속한 time 에 대해서는 track.values 내의 해당 값을 적용한다. v
  //  2) track.times 에 속하지 않는 time 에 대해서는 앞 뒤 값을 통해 (v1 + (v2 - v1)) / (t2 - t1) 값을 적용한다.
  // 3. track.times 의 마지막 시점 부터는 해당 track.values 의 마지막 값을 적용한다. v

  // track.times 가 빈 배열일 경우, values 를 0 으로 채운 후 return
  if (times.length === 0) {
    return {
      name: track.name,
      times: newTimes,
      values: _.fill(Array(newTimes.length * 3), 0),
      interpolation: track.interpolation,
    };
  }

  // track.times 가 빈 배열이 아닐 때
  _.forEach(targetTimes, (targetTime, index) => {
    // 1
    if (targetTime < times[0]) {
      newValues.push(values[0]);
      newValues.push(values[1]);
      newValues.push(values[2]);
      // 2
    } else if (targetTime < times[times.length - 1]) {
      const timeIndex = _.findIndex(times, (t) => t === targetTime);
      // 2-1)
      if (timeIndex !== -1) {
        newValues.push(values[timeIndex * 3]);
        newValues.push(values[timeIndex * 3 + 1]);
        newValues.push(values[timeIndex * 3 + 2]);
        // 2-2)
      } else {
        const prevTimeIndex = _.findLastIndex(times, (t) => t < targetTime);
        const nextTimeIndex = _.findIndex(times, (t) => t > targetTime);
        const deltaTime = times[nextTimeIndex] - times[prevTimeIndex];
        const deltaValues = {
          x: values[nextTimeIndex * 3] - values[prevTimeIndex * 3],
          y: values[nextTimeIndex * 3 + 1] - values[prevTimeIndex * 3 + 1],
          z: values[nextTimeIndex * 3 + 2] - values[prevTimeIndex * 3 + 2],
        };
        newValues.push(
          values[prevTimeIndex * 3] +
            (deltaValues.x / deltaTime) * (targetTime - times[prevTimeIndex]),
        );
        newValues.push(
          values[prevTimeIndex * 3 + 1] +
            (deltaValues.y / deltaTime) * (targetTime - times[prevTimeIndex]),
        );
        newValues.push(
          values[prevTimeIndex * 3 + 2] +
            (deltaValues.z / deltaTime) * (targetTime - times[prevTimeIndex]),
        );
      }
      // 3
    } else if (targetTime >= times[times.length - 1]) {
      newValues.push(values[values.length - 3]);
      newValues.push(values[values.length - 2]);
      newValues.push(values[values.length - 1]);
    }
  });

  return {
    name: track.name,
    times: newTimes,
    values: newValues,
    interpolation: track.interpolation,
  };
};

export default fnGetInterpolatedTrackLinear;
