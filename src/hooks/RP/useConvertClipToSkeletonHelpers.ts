import { PROPERTY_TYPES } from 'interfaces';
import _ from 'lodash';
import * as THREE from 'three';

interface convertClipToSkeletonHelpersProps {
  animationClip: THREE.AnimationClip | undefined;
}
interface animationClip2Types {
  name: string;
  times: Float32Array;
  values: Float32Array;
}
const convertToAnimationClip2 = ({ animationClip }: convertClipToSkeletonHelpersProps) => {
  const result: animationClip2Types[] = [];
  let name;
  let values;
  // 타임프레임 합집합을 구한다
  const unionTimes = _.union(_.map(animationClip?.tracks, (track) => track.times));
  _.forEach(animationClip?.tracks, (track) => {
    name = _.cloneDeep(track.name);
    values = _.cloneDeep(track.values);
    if (_.includes(track.name, PROPERTY_TYPES.quaternion)) {
      name = _.replace(name, PROPERTY_TYPES.quaternion, PROPERTY_TYPES.rotation);
      // 4개씩 묶음으로 나눈다
      const valuesBundles = _.chunk(values, PROPERTY_TYPES.quaternionCnt);
      values = [];
      _.forEach(valuesBundles, (bundle) => {
        const q = new THREE.Quaternion(...bundle);
        // 오일러로 변환
        const { x, y, z } = new THREE.Euler().setFromQuaternion(q.normalize(), 'XYZ');
        values.push(x);
        values.push(y);
        values.push(z);
      });
    }
    result.push({
      name,
      times: _.cloneDeep(track.times),
      values: values as any,
    });
  });
  return result;
};
export const convertClipToSkeletonHelpers = ({
  animationClip,
}: convertClipToSkeletonHelpersProps) => {
  const animaionClip2 = convertToAnimationClip2({ animationClip });
};
