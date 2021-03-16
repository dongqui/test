import * as THREE from 'three';
import _ from 'lodash';

interface FnQuaternionToEulerTracks {
  quaternionTracks: THREE.QuaternionKeyframeTrack[];
}

/**
 * Quaternion 값을 사용하는 rotation 트랙들을 Euler 값을 사용하는 rotation 트랙들로 변환합니다.
 *
 * @param quaternionTracks - euler tracks 로 변경할 quaternion tracks
 *
 * @returns 변환한 euler tracks
 */
const fnQuaternionToEulerTracks = ({ quaternionTracks }: FnQuaternionToEulerTracks) => {
  const eulerTracks: any[] = [];
  _.forEach(quaternionTracks, (track) => {
    const { name, times, values } = track;
    const [boneName, propertyName] = name.split('.');
    const newName = `${boneName}.rotation`;
    const newTimes = _.cloneDeep(times);
    const newValues: number[] = [];
    let inner: number[] = [];
    _.forEach(values, (value: number, idx: number) => {
      inner.push(value);
      if (idx % 4 === 3) {
        const q = new THREE.Quaternion(...inner);
        const e = new THREE.Euler().setFromQuaternion(q.normalize(), 'XYZ');
        const { x, y, z } = e;
        newValues.push(x);
        newValues.push(y);
        newValues.push(z);
        inner = [];
      }
    });
    eulerTracks.push(new THREE.VectorKeyframeTrack(newName, _.toArray(newTimes), newValues));
  });
  return eulerTracks;
};

export default fnQuaternionToEulerTracks;
