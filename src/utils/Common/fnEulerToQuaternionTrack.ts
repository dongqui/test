import * as THREE from 'three';
import _ from 'lodash';

interface FnEulerToQuaternionTrack {
  eulertrack: THREE.VectorKeyframeTrack;
}

/**
 * Euler 값을 사용하는 rotation 트랙을 Quaternion 값을 사용하는 rotation 트랙으로 변환합니다.
 *
 * @param eulertrack - quaternion track 으로 변경할 euler track
 *
 * @returns 변환한 quaternion track
 */
const fnEulerToQuaternionTrack = (props: FnEulerToQuaternionTrack) => {
  const { eulertrack } = props;
  const { name, times, values } = eulertrack;
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
  return new THREE.QuaternionKeyframeTrack(newName, _.toArray(newTimes), newValues);
};

export default fnEulerToQuaternionTrack;
