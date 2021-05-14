import { BoneTransformAction } from 'actions/boneTransform';
import { withUndoable } from 'hoc';

interface BoneTransformState {
  bone?: THREE.Bone;
  position?: Transform.Normal;
  quaternion?: Transform.Quaternion;
  rotation?: Transform.Normal;
  scale?: Transform.Normal;
}

const defaultState: BoneTransformState = {
  bone: undefined,
  position: undefined,
  quaternion: undefined,
  rotation: undefined,
  scale: undefined,
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
