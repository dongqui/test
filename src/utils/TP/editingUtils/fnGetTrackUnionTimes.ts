import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types/common';

interface FnGetTrackUnionTimes {
  track: ShootTrackType;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

/**
 * 대상 트랙의 모든 layer 에서의 times 를 합한 배열을 반환합니다.
 *
 * @param track - 대상 트랙
 * @param baseLayer - base layer
 * @param layers - layers
 *
 * @returns 대상 트랙의 모든 layer 에서의 times 를 합한 배열
 */
const fnGetTrackUnionTimes = (props: FnGetTrackUnionTimes) => {
  const { track, baseLayer, layers } = props;
  if (layers.length === 0) {
    return track.times;
  }
  const targetTimes = [];
  // base layer 내 대상 트랙의 times
  targetTimes.push(_.find(baseLayer, (tr) => tr.name === track.name)?.times);
  // layers 내 대상 트랙의 times
  _.forEach(layers, (layer) => {
    targetTimes.push(_.find(layer.tracks, (tr) => tr.name === track.name)?.times);
  });
  return _.union(targetTimes);
};

export default fnGetTrackUnionTimes;
