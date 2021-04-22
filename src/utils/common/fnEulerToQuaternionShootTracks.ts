import * as THREE from 'three';
import _ from 'lodash';
import { ShootTrackType } from 'types';

interface FnEulerToQuaternionShootTracks {
  eulerTracks: ShootTrackType[];
}

/**
 * 자체적인 ShootTrack 타입의 euler 트랙들을 quaternion 트랙들로 변환합니다.
 *
 * @param eulerTracks - quaternion tracks 로 변경할 euler tracks
 *
 * @returns 변환한 quaternion tracks
 */
const fnEulerToQuaternionShootTracks = ({ eulerTracks }: FnEulerToQuaternionShootTracks) => {
  const quaternionTracks: ShootTrackType[] = [];
  _.forEach(eulerTracks, (track) => {
    const { name, times, values, interpolation, isIncluded } = track;
    const boneName = name.substring(0, name.lastIndexOf('.'));
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
    quaternionTracks.push({
      name: newName,
      times: _.toArray(newTimes),
      values: newValues,
      interpolation,
      isIncluded,
    });
  });
  return quaternionTracks;
};

export default fnEulerToQuaternionShootTracks;
