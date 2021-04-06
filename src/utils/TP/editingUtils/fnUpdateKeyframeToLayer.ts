import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';
import { fnGetInterpolatedTrackLinear, fnGetTrackUnionTimes } from 'utils/TP/editingUtils';

interface FnUpdateKeyframeToLayer {
  track: ShootTrackType;
  currentLayerKey: string;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  time: number;
  values: {
    x: number;
    y: number;
    z: number;
  };
}

/**
 * base layer 외의 layer 에 속한 트랙의 키프레임을 추가/수정합니다.
 * base layer 에 대한 추가/수정과는 달리, 트랙에 delta 값을 저장합니다.
 * 예를 들어, base layer 와 layer 1 이 있고 현재 (time = 0.3333) RP 내에서 특정 Bone 의 position x 값이 10일 때,
 * base layer 의 해당 트랙이 그 시점 (0.3333)에 5의 값을 가진다면, layer 1 에 추가한 키프레임이 갖는 값은 5 (10 - 5) 입니다.
 * 이때 base layer 의 해당 트랙이 그 시점(0.3333) 에 값을 갖지 않는다면, 자체적으로 보간한 값을 사용해 delta 값을 구합니다.
 *
 * @param track - 키프레임을 추가/수정할 대상 트랙
 * @param currentLayerKey - 현재 layer 의 key 값
 * @param baseLayer - base layer
 * @param layers - layers
 * @param time - 대상 시점 (현재 RP 에서 보이고 있는 시점)
 * @param values - 추가/수정 시 사용할 값 (x, y, z)
 *
 * @returns 키프레임이 추가/수정된 새로운 track
 *
 */
const fnUpdateKeyframeToLayer = (props: FnUpdateKeyframeToLayer): ShootTrackType => {
  const { track, currentLayerKey, baseLayer, layers, time, values } = props;

  const emptyTrack = {
    name: 'empty',
    times: [],
    values: [],
    interpolation: 'linear',
    isIncluded: true,
  };

  // delta values 구하기
  const unionTimes = fnGetTrackUnionTimes({ track, baseLayer, layers });
  const unionTimeIndex = _.findIndex(unionTimes, (t) => _.round(t, 4) === _.round(time, 4));

  const baseLayerTrack = _.find(baseLayer, (t) => t.name === track.name) || emptyTrack;
  const otherLayerTracks = _.map(
    _.filter(layers, (layer) => layer.key !== currentLayerKey),
    (lay) => _.find(lay.tracks, (t) => t.name === track.name) || emptyTrack,
  );

  const interpolatedBaseTrack = fnGetInterpolatedTrackLinear({ unionTimes, track: baseLayerTrack });
  const interpolatedOtherLayerTracks = _.map(otherLayerTracks, (t) =>
    fnGetInterpolatedTrackLinear({ unionTimes, track: t }),
  );

  // base layer 값 빼기
  let deltaX = values.x - interpolatedBaseTrack.values[unionTimeIndex * 3];
  let deltaY = values.y - interpolatedBaseTrack.values[unionTimeIndex * 3 + 1];
  let deltaZ = values.z - interpolatedBaseTrack.values[unionTimeIndex * 3 + 2];

  // other layers 돌면서 값 빼기
  if (interpolatedOtherLayerTracks.length !== 0) {
    _.forEach(interpolatedOtherLayerTracks, (interpolatedOtherLayerTrack) => {
      deltaX = deltaX - interpolatedOtherLayerTrack.values[unionTimeIndex + 3];
      deltaY = deltaY - interpolatedOtherLayerTrack.values[unionTimeIndex + 3 + 1];
      deltaZ = deltaZ - interpolatedOtherLayerTrack.values[unionTimeIndex + 3 + 2];
    });
  }
  const deltaValues = {
    x: deltaX,
    y: deltaY,
    z: deltaZ,
  };

  // delta values 적용하기
  let newTimes = _.clone(track.times);
  let newValues = _.clone(track.values);
  let timeIndex = _.findIndex(track.times, (t) => _.round(t, 4) === _.round(time, 4));
  // 빈 배열인 경우
  if (newTimes.length === 0) {
    newTimes = [time];
    newValues = [deltaValues.x, deltaValues.y, deltaValues.z];
  } else {
    // 해당 time 이 track 의 times 내에 존재하지 않는 경우 (키프레임 추가에 해당)
    if (timeIndex === -1) {
      if (time > track.times[track.times.length - 1]) {
        // 기존 times 뒤에 키프레임 추가
        newTimes = [...newTimes, time];
        newValues = [...newValues, deltaValues.x, deltaValues.y, deltaValues.z];
      } else if (time < track.times[0]) {
        // 기존 times 앞에 키프레임 추가
        newTimes = [time, ...newTimes];
        newValues = [deltaValues.x, deltaValues.y, deltaValues.z, ...newValues];
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
          deltaValues.x,
          deltaValues.y,
          deltaValues.z,
          ..._.slice(newValues, 3 * (timeIndex + 1)),
        ];
      }
      // 해당 time 이 track 의 times 내에 이미 존재하는 경우 (키프레임 수정에 해당)
    } else {
      newValues[timeIndex * 3] = deltaValues.x;
      newValues[timeIndex * 3 + 1] = deltaValues.y;
      newValues[timeIndex * 3 + 2] = deltaValues.z;
    }
  }
  return {
    name: track.name,
    times: newTimes.map((time) => _.round(time, 4)),
    values: newValues,
    interpolation: track.interpolation,
    isIncluded: true,
  };
};

export default fnUpdateKeyframeToLayer;
