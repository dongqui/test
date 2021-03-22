import _, { forEach } from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';

interface FnGetSummaryTimes {
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}
/**
 * 모든 트랙의 모든 layer 에서의 times 를 합한 배열, 즉 애니메이션이 value 를 가지는 모든 time 을 담고 있는 배열을 반환합니다.
 * Summary 트랙의 돕싯을 찍을 때 사용할 수 있습니다.
 *
 * @param baseLayer - base layer
 * @param layers - layers
 *
 * @returns 모든 트랙의 모든 layer 에서의 times 를 합한 배열
 *
 */
const fnGetSummaryTimes = (props: FnGetSummaryTimes) => {
  const { baseLayer, layers } = props;
  const targetTimes: Array<number[]> = [];

  // base layer 내 모든 트랙의 times
  forEach(baseLayer, (track) => {
    targetTimes.push(track.times);
  });
  // layers 내 모든 트랙의 times
  forEach(layers, (layer) => {
    forEach(layer.tracks, (track) => {
      targetTimes.push(track.times);
    });
  });
  return _.union(...targetTimes).sort();
};

export default fnGetSummaryTimes;
