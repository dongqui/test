export type BoneTransformAction = ReturnType<typeof changeBoneTransform>;

export const CHANGE_BONE_TRANSFORM = 'boneTransform/CHANGE_BONE_TRANSFORM' as const;

interface ChangeBoneTransform {
  bone: THREE.Bone;
  position: Transform.Normal;
  quaternion: Transform.Quaternion;
  rotation: Transform.Normal;
  scale: Transform.Normal;
}

export const changeBoneTransform = (params: ChangeBoneTransform) => ({
  type: CHANGE_BONE_TRANSFORM,
  payload: {
    ...params,
  },
});
