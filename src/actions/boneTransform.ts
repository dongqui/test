export interface BoneTransformState {
  bone?: THREE.Bone;
  position?: { x: number; y: number; z: number };
  quaternion?: { x: number; y: number; z: number; w: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export type BoneTransformAction = ReturnType<typeof changeBoneTransform>;

export const CHANGE_BONE_TRANSFORM = 'boneTransform/CHANGE_BONE_TRANSFORM' as const;

interface ChangeBoneTransform {
  bone: THREE.Bone;
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export const changeBoneTransform = (params: ChangeBoneTransform) => ({
  type: CHANGE_BONE_TRANSFORM,
  payload: {
    ...params,
  },
});
