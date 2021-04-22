import * as THREE from 'three';
import _ from 'lodash';
import { ShootTrackType } from 'types';

interface FnQuaternionToEulerShootTracks {
  quaternionTracks: ShootTrackType[];
}

/**
 * 자체적인 ShootTrack 타입의 quaternion 트랙들을 euler 트랙들로 변환합니다.
 *
 * @param quaternionTracks - euler tracks 로 변경할 quaternion tracks
 *
 * @returns 변환한 euler tracks
 */
const fnQuaternionToEulerShootTracks = ({ quaternionTracks }: FnQuaternionToEulerShootTracks) => {
  const eulerTracks: ShootTrackType[] = [];
  _.forEach(quaternionTracks, (track) => {
    const { name, times, values, interpolation, isIncluded } = track;
    const boneName = name.substring(0, name.lastIndexOf('.'));
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
    eulerTracks.push({
      name: newName,
      times: _.toArray(newTimes),
      values: newValues,
      interpolation,
      isIncluded,
    });
  });
  return eulerTracks;
};

export default fnQuaternionToEulerShootTracks;
