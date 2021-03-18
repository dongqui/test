import * as THREE from 'three';
import _ from 'lodash';

interface FnEulerToQuaternionTracks {
  eulerTracks: THREE.VectorKeyframeTrack[];
}

/**
 * Euler 값을 사용하는 rotation 트랙들을 Quaternion 값을 사용하는 rotation 트랙들로 변환합니다.
 *
 * @param eulerTracks - quaternion tracks 로 변경할 euler tracks
 *
 * @returns 변환한 quaternion tracks
 */
const fnEulerToQuaternionTracks = ({ eulerTracks }: FnEulerToQuaternionTracks) => {
  const quaternionTracks: THREE.QuaternionKeyframeTrack[] = [];
  _.forEach(eulerTracks, (track) => {
    const { name, times, values } = track;
    const [boneName, propertyName] = name.split('.');
    const newName = `${boneName}.quaternion`;
    const newTimes = _.cloneDeep(times);
    const newValues: number[] = [];
    let inner: number[] = [];
    _.forEach(values, (value: number, idx: number) => {
      inner.push(value);
      if (idx % 3 === 2) {
        const e = new THREE.Euler(...inner);
        const q = new THREE.Quaternion().setFromEuler(e);
        const { x, y, z, w } = q;
        newValues.push(x);
        newValues.push(y);
        newValues.push(z);
        newValues.push(w);
        inner = [];
      }
    });
    quaternionTracks.push(
      new THREE.QuaternionKeyframeTrack(newName, _.toArray(newTimes), newValues),
    );
  });
  return quaternionTracks;
};

export default fnEulerToQuaternionTracks;
