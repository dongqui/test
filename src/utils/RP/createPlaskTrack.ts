import * as BABYLON from '@babylonjs/core';
import { PlaskProperty, PlaskTrack } from 'types/common';
import { roundToFourth } from 'utils/common';
import { DEFAULT_BETA, DEFAULT_MIN_CUTOFF, MOCAP_QUATERNION_BETA, MOCAP_QUATERNION_MIN_CUTOFF, MOCAP_POSITION_BETA, MOCAP_POSITION_MIN_CUTOFF } from 'utils/const';

/**
 * AnimationIngredient를 구성하는 자체 데이터인 PlaskTrack을 생성합니다.
 * 생성 과정에서 모든 key의 frame을 소수점 넷째자리까지 반올림합니다.
 *
 * @param name - track의 이름
 * @param layerId - track이 해당하는 layer의 id
 * @param target - track이 담은 애니메이션 데이터가 움직일 대상
 * @param property - track이 담은 애니메이션 데이터가 움직일 대상의 속성
 * @param transformKeys - frame과 value 쌍으로 이루어진 transformKey 배열
 * @param isMocapAnimation - mocap 결과물인지 여부
 */
const createPlaskTrack = (name: string, layerId: string, target: any, property: PlaskProperty, transformKeys: BABYLON.IAnimationKey[], isMocapAnimation: boolean): PlaskTrack => {
  let filterBeta = DEFAULT_BETA;
  let filterMinCutoff = DEFAULT_MIN_CUTOFF;

  if (isMocapAnimation) {
    if (property === 'rotationQuaternion') {
      filterBeta = MOCAP_QUATERNION_BETA;
      filterMinCutoff = MOCAP_QUATERNION_MIN_CUTOFF;
    } else if (property === 'position') {
      filterBeta = MOCAP_POSITION_BETA;
      filterMinCutoff = MOCAP_POSITION_MIN_CUTOFF;
    }
  }

  return {
    id: `${target.id}//${property}`,
    targetId: target.id,
    layerId,
    name,
    property,
    target, // 이후 targetAnimation을 생성을 위해 참조를 유지합니다.
    transformKeys: transformKeys.map((transformKey) => ({
      frame: roundToFourth(transformKey.frame),
      value: transformKey.value,
    })),
    interpolationType: 'linear',
    isMocapAnimation,
    useFilter: isMocapAnimation ? true : false, // mocap 결과물의 경우에만 기본으로 filter를 적용합니다.
    filterBeta,
    filterMinCutoff,
    isIncluded: true,
    isLocked: false,
  };
};

export default createPlaskTrack;
