import * as THREE from 'three';
import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types/common';

interface FnGetAnimationClip {
  name: string;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

/**
 * base layer 와 layers 를 통해 새로운 animation clip 을 생성 후 반환합니다.
 *
 * @param name -
 * @param baseLayer -
 * @param layers -
 *
 * returns 생성한 animation clip
 */
const fnGetAnimationClip = (props: FnGetAnimationClip) => {
  // baseLayer 와 layers 를 사용한다.
  // 각 layers 들은 동일한 track 들로 채워져있다.
  // input 으로 받은

  const { name, baseLayer, layers } = props;
  _.forEach(baseLayer, (track) => {});

  return new THREE.AnimationClip();
  // name,
  // duration,
  // tracks,
};

export default fnGetAnimationClip;
