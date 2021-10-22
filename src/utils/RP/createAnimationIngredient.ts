import * as BABYLON from '@babylonjs/core';
import { AnimationIngredient, ShootProperty, ShootTrack } from 'types/common';
import { v4 as uuidv4 } from 'uuid';

// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
const DEFAULT_BETA = 0.0;
const DEFAULT_MIN_CUTOFF = 1.0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
const MOCAP_POSITION_BETA = 0.002;
const MOCAP_POSITION_MIN_CUTOFF = 0.05;
const MOCAP_QUATERNION_BETA = 0.3;
const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;

type Axis = 'x' | 'y' | 'z';
type QuaternionAxis = Axis | 'w';

type TransformKeys = {
  [axis in Axis]: BABYLON.IAnimationKey[];
};
type QuaterionTransformKeys = {
  [axis in QuaternionAxis]: BABYLON.IAnimationKey[];
};

const createTrack = (
  name: string,
  layerId: string,
  target: any,
  property: ShootProperty,
  axis: QuaternionAxis,
  transformKeys: BABYLON.IAnimationKey[],
  isMocapAnimation: boolean,
): ShootTrack => {
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
    targetId: target.id,
    layerId,
    name,
    property,
    axis,
    target, // 이후 targetAnimation을 생성을 위해 참조를 유지합니다.
    transformKeys,
    interpolationType: 'linear',
    useFilter: isMocapAnimation ? true : false, // mocap 결과물의 경우에만 기본으로 filter를 적용합니다.
    filterBeta,
    filterMinCutoff,
    isIncluded: true,
    isLocked: false,
  };
};

/**
 * 파일의 animationGroup을 사용해 Shoot 자체적으로 사용하는 구조의 데이터(AnimationIngredient)를 생성합니다.
 * @param assetId - 본 애니메이션의 대상 asset
 * @param animationGroup - source로 사용할 파일의 animationGroup
 * @param isMocapAnimation - filter parameter 적용을 위한 mocap 결과물인지 여부
 * @param current - 현재 scene에서 사용 중인지 여부
 */
const createAnimationIngredient = (
  assetId: string,
  animationGroup: BABYLON.AnimationGroup,
  isMocapAnimation: boolean,
  current: boolean,
): AnimationIngredient => {
  const layerId = uuidv4();

  const tracks: ShootTrack[] = [];
  // animationGroup을 생성하기 위해 사용한 targetAnimations를 순회하며 Axis-depth의 트랙들을 구성합니다.
  animationGroup.targetedAnimations.forEach((targetAnimation) => {
    const { target, animation } = targetAnimation;
    if (animation.targetProperty === 'position') {
      const positionTransformKeys: TransformKeys = {
        x: [],
        y: [],
        z: [],
      };

      // Property-depth의 트랙들의 value들을 axis별로 분리합니다.
      animation.getKeys().forEach((key) => {
        positionTransformKeys.x.push({ frame: key.frame, value: key.value.x });
        positionTransformKeys.y.push({ frame: key.frame, value: key.value.y });
        positionTransformKeys.z.push({ frame: key.frame, value: key.value.z });
      });

      // position 트랙들 전처리
      Object.keys(positionTransformKeys).forEach((axis) => {
        tracks.push(
          createTrack(
            `${animation.name}|${axis}`,
            layerId,
            target,
            'position',
            axis as Axis,
            positionTransformKeys[axis as Axis],
            isMocapAnimation,
          ),
        );
      });
    } else if (animation.targetProperty === 'rotationQuaternion') {
      const quaternionTransformKeys: QuaterionTransformKeys = {
        x: [],
        y: [],
        z: [],
        w: [],
      };

      const eulerTransformKeys: TransformKeys = {
        x: [],
        y: [],
        z: [],
      };

      animation.getKeys().forEach((key) => {
        quaternionTransformKeys.x.push({ frame: key.frame, value: key.value.x });
        quaternionTransformKeys.y.push({ frame: key.frame, value: key.value.y });
        quaternionTransformKeys.z.push({ frame: key.frame, value: key.value.z });
        quaternionTransformKeys.w.push({ frame: key.frame, value: key.value.w });

        const q: BABYLON.Quaternion = key.value;
        const e = q.normalize().toEulerAngles();
        eulerTransformKeys.x.push({ frame: key.frame, value: e.x });
        eulerTransformKeys.y.push({ frame: key.frame, value: e.y });
        eulerTransformKeys.z.push({ frame: key.frame, value: e.z });
      });

      // rotationQuaternion 트랙들 전처리
      Object.keys(quaternionTransformKeys).forEach((axis) => {
        tracks.push(
          createTrack(
            `${animation.name}|${axis}`,
            layerId,
            target,
            'rotationQuaternion',
            axis as QuaternionAxis,
            quaternionTransformKeys[axis as QuaternionAxis],
            isMocapAnimation,
          ),
        );
      });

      // rotation 트랙들 전처리
      Object.keys(eulerTransformKeys).forEach((axis) => {
        tracks.push(
          createTrack(
            `${animation.name}|${axis}`,
            layerId,
            target,
            'rotation',
            axis as Axis,
            eulerTransformKeys[axis as Axis],
            isMocapAnimation,
          ),
        );
      });
    } else if (animation.targetProperty === 'scaling') {
      const scalingTransformKeys: TransformKeys = {
        x: [],
        y: [],
        z: [],
      };

      animation.getKeys().forEach((key) => {
        scalingTransformKeys.x.push({ frame: key.frame, value: key.value.x });
        scalingTransformKeys.y.push({ frame: key.frame, value: key.value.y });
        scalingTransformKeys.z.push({ frame: key.frame, value: key.value.z });
      });

      Object.keys(scalingTransformKeys).forEach((axis) => {
        tracks.push(
          createTrack(
            `${animation.name}|${axis}`,
            layerId,
            target,
            'scaling',
            axis as Axis,
            scalingTransformKeys[axis as Axis],
            isMocapAnimation,
          ),
        );
      });
    }
    // 전처리를 끝낸 source animation은 타겟의 애니메이션 목록에서 지워줍니다.
    target.animations = target.animations.filter(
      (animation: BABYLON.Animation) => animation !== animation,
    );
  });

  const animationIngredient = {
    id: uuidv4(),
    name: animationGroup.name,
    assetId,
    current,
    tracks,
    layers: [{ id: layerId, name: 'layer1' }],
  };

  return animationIngredient;
};

export default createAnimationIngredient;
