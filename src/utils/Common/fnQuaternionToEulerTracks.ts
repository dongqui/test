import * as THREE from 'three';
import _ from 'lodash';

interface fnQuaternionToEulerTracksProps {
  quaternionTracks: THREE.QuaternionKeyframeTrack[];
}

export const fnQuaternionToEulerTracks = ({ quaternionTracks }: fnQuaternionToEulerTracksProps) => {
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
