import * as THREE from 'three';
import _ from 'lodash';

interface FnQuaternionToEulerTrack {
  quaternionTrack: THREE.QuaternionKeyframeTrack;
}

/**
 * Quaternion 값을 사용하는 rotation 트랙을 Euler 값을 사용하는 rotation 트랙으로 변환합니다.
 *
 * @param quaternionTrack - euler track 로 변경할 quaternion track
 *
 * @returns 변환한 euler track
 */
const fnQuaternionToEulerTrack = (props: FnQuaternionToEulerTrack) => {
  const { quaternionTrack } = props;
  const { name, times, values } = quaternionTrack;
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
  return new THREE.VectorKeyframeTrack(newName, _.toArray(newTimes), newValues);
};

export default fnQuaternionToEulerTrack;
