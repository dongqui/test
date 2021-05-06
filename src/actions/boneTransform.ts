import * as THREE from 'three';

export interface BoneTransformState {
  bone?: THREE.Bone;
  position?: { x: number; y: number; z: number };
  quaternion?: { x: number; y: number; z: number; w: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export type BoneTransfromAction = ReturnType<typeof changeBoneTransform>;

export const CHANGE_BONE_TRANSFORM = 'boneTransform/CHANGE_BONE_TRANSFORM' as const;
export const UNDO = 'UNDO';
export const REDO = 'REDO';

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

export const unDo = () => ({
  type: UNDO,
});

export const reDo = () => ({
  type: REDO,
});
