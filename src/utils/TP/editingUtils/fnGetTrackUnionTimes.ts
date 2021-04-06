import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';

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
    return track.times.map((t) => _.round(t, 4));
  }
  const targetTimes = [];
  // base layer 내 대상 트랙의 times
  const baseLayerTrack = _.find(baseLayer, (tr) => tr.name === track.name);
  if (baseLayerTrack) {
    targetTimes.push(baseLayerTrack.times.map((t) => _.round(t, 4)));
  }
  // layers 내 대상 트랙의 times
  _.forEach(layers, (layer) => {
    const layerTrack = _.find(layer.tracks, (tr) => tr.name === track.name);
    if (layerTrack) {
      targetTimes.push(layerTrack.times.map((t) => _.round(t, 4)));
    }
  });
  return _.union(...targetTimes).sort((a, b) => a - b);
};

export default fnGetTrackUnionTimes;
