import { BoneTransformAction } from 'actions/boneTransform';
import { withUndoable } from 'hoc';

export interface BoneTransformState {
  bone: THREE.Bone | null;
  position: Transform.Normal | null;
  quaternion: Transform.Quaternion | null;
  rotation: Transform.Normal | null;
  scale: Transform.Normal | null;
}

const defaultState: BoneTransformState = {
  bone: null,
  position: null,
  quaternion: null,
  rotation: null,
  scale: null,
};

const boneTransform = (state = defaultState, action: BoneTransformAction) => {
  switch (action.type) {
    case 'boneTransform/CHANGE_BONE_TRANSFORM': {
      return Object.assign({}, state, {
        bone: action.payload.bone,
        position: action.payload.position,
        quaternion: action.payload.quaternion,
        rotation: action.payload.rotation,
        scale: action.payload.scale,
      });
    }
    default: {
      return state;
    }
  }
};

export const undoableBoneTransform = withUndoable(boneTransform);
