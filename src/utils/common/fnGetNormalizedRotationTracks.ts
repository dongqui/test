import * as THREE from 'three';
import _ from 'lodash';

const TWO_PI = 2 * Math.PI;

/**
 * Euler 트랙들을 normalize 합니다.
 *
 * @param eulerTracks - Normalize 할 euler tracks
 *
 * @returns 정규화를 거친 euler tracks
 */
const fnGetNormalizedEulerTracks = (eulerTracks: THREE.VectorKeyframeTrack[]) => {
  const normalizedEulerTracks: THREE.VectorKeyframeTrack[] = [];

  _.forEach(eulerTracks, (track, idx) => {
    const { name, times, values } = track;
    const newTimes = _.cloneDeep(times);
    const newValues = values.map((value) => {
      let normalized = value % TWO_PI;
      normalized = (normalized + TWO_PI) % TWO_PI;
      return normalized <= Math.PI ? normalized : normalized - TWO_PI;
    });
    normalizedEulerTracks.push(
      new THREE.VectorKeyframeTrack(name, _.toArray(newTimes), _.toArray(newValues)),
    );
  });

  return normalizedEulerTracks;
};

export default fnGetNormalizedEulerTracks;
