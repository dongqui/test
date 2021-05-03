import * as THREE from 'three';
import _ from 'lodash';

interface FnGetNormalizedQuaternionTracks {
  quaternionTracks: THREE.QuaternionKeyframeTrack[];
}

/**
 * Quaternion 트랙들을 normalize 합니다.
 *
 * @param quaternionTracks - Normalize 할 quaternion tracks
 *
 * @returns 정규화를 거친 quaternion tracks
 */
const fnGetNormalizedQuaternionTracks = ({ quaternionTracks }: FnGetNormalizedQuaternionTracks) => {
  const normalizedQuaternionTracks: THREE.QuaternionKeyframeTrack[] = [];

  _.forEach(quaternionTracks, (track) => {
    const { name, times, values } = track;
    const newTimes = _.cloneDeep(times);
    const newValues: number[] = [];
    let inner: number[] = [];
    _.forEach(values, (value: number, idx: number) => {
      inner.push(value);
      if (idx % 4 === 3) {
        const q = new THREE.Quaternion(...inner).normalize();
        const { x, y, z, w } = q;
        newValues.push(x);
        newValues.push(y);
        newValues.push(z);
        newValues.push(w);
        inner = [];
      }
    });
    normalizedQuaternionTracks.push(
      new THREE.QuaternionKeyframeTrack(name, _.toArray(newTimes), newValues),
    );
  });

  return normalizedQuaternionTracks;
};

export default fnGetNormalizedQuaternionTracks;
