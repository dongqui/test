import _ from 'lodash';
import { ShootTrackType } from 'types';

interface FnGetLayerTimes {
  targetLayer: ShootTrackType[];
}
/**
 * 대상 Layer 의 모든 track 의 times 를 합한 times 배열을 반환합니다.
 * Layer 트랙을 닫은 경우 돕싯을 찍을 때 사용할 수 있습니다.
 *
 * @param targetLayer - 대상 layer
 *
 * @returns 대상 layer 의 모든 track 의 times 를 합한 배열
 *
 */
const fnGetLayerTimes = (props: FnGetLayerTimes) => {
  const { targetLayer } = props;
  const targetTimes: Array<number[]> = [];

  // base layer 내 모든 트랙의 times
  _.forEach(targetLayer, (track) => {
    targetTimes.push(track.times.map((t) => _.round(t, 4)));
  });
  return _.union(...targetTimes).sort((a, b) => a - b);
};

export default fnGetLayerTimes;
