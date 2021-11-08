import * as BABYLON from '@babylonjs/core';
import { v4 as uuidv4 } from 'uuid';
import { AnimationIngredient, ShootAsset } from 'types/common';
import createShootTrack from './createShootTrack';
import { roundToFourth } from 'utils/common';

const DUMMY_JSON_URL = 'motions/dummyMotion.json';

const createDummyAnimation = async (asset: ShootAsset): Promise<AnimationIngredient> => {
  const data: { name: string; times: number[]; values: number[] }[] = await fetch(DUMMY_JSON_URL)
    .then((file) => file.json())
    .then((res) => res.data);

  const animId = uuidv4();
  const layerId = uuidv4();

  const hipsBone = asset.bones[1];

  const frames: number[] = data[0].times.map((t) => roundToFourth(t));

  const hipsPositionTransformKeys: BABYLON.IAnimationKey[] = [];
  frames.forEach((f, idx) => {
    hipsPositionTransformKeys.push({
      frame: f,
      value: BABYLON.Vector3.FromArray([
        data[0].values[3 * idx],
        data[0].values[3 * idx + 1],
        data[0].values[3 * idx + 2],
      ]),
    });
  });

  const hipsRotationQuaternionTransformKeys: BABYLON.IAnimationKey[] = [];
  const hipsRotationTransformKeys: BABYLON.IAnimationKey[] = [];

  frames.forEach((f, idx) => {
    const q = BABYLON.Quaternion.FromArray([
      data[1].values[4 * idx],
      data[1].values[4 * idx + 1],
      data[1].values[4 * idx + 2],
      data[1].values[4 * idx + 3],
    ]);

    hipsRotationQuaternionTransformKeys.push({
      frame: f,
      value: q,
    });
    hipsRotationTransformKeys.push({
      frame: f,
      value: q.normalize().toEulerAngles(),
    });
  });

  const hipsPositionTrack = createShootTrack(
    `newAnim|${hipsBone.name}|position`,
    layerId,
    hipsBone.getTransformNode(),
    'position',
    hipsPositionTransformKeys,
    false,
  );

  const hipsRotationQuaternionTrack = createShootTrack(
    `newAnim|${hipsBone.name}|rotationQuaternion`,
    layerId,
    hipsBone.getTransformNode(),
    'rotationQuaternion',
    hipsRotationQuaternionTransformKeys,
    false,
  );

  const hipsRotationTrack = createShootTrack(
    `newAnim|${hipsBone.name}|rotation`,
    layerId,
    hipsBone.getTransformNode(),
    'rotation',
    hipsRotationTransformKeys,
    false,
  );

  const animationIngredient = {
    id: animId,
    name: 'newAnim',
    assetId: asset.id,
    current: true,
    tracks: [hipsPositionTrack, hipsRotationQuaternionTrack, hipsRotationTrack],
    layers: [{ id: layerId, name: 'newLayer' }],
  };

  return animationIngredient;
};

export default createDummyAnimation;
