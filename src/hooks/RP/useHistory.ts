import * as THREE from 'three';
import _ from 'lodash';

export const useHistory = () => {
  const undoArray: any[] = [];
  const redoArray: any[] = [];

  const pushToUndoArray = ({
    bone,
    mode,
    value,
  }: {
    bone: THREE.Bone;
    mode: string;
    value: any;
  }) => {
    undoArray.push({ bone, mode, value });
  };

  const popFromUndoArray = () => {
    if (undoArray.length !== 0) {
      const undoInfo = undoArray.pop();
      const { bone, mode } = undoInfo;
      let value;
      switch (mode) {
        case 'translate':
          value = {
            x: bone.position.x,
            y: bone.position.y,
            z: bone.position.z,
          };
          break;
        case 'rotate':
          value = {
            x: bone.quaternion.x,
            y: bone.quaternion.y,
            z: bone.quaternion.z,
            w: bone.quaternion.w,
          };
          break;
        case 'scale':
          value = {
            x: bone.scale.x,
            y: bone.scale.y,
            z: bone.scale.z,
          };
          break;
        default:
          break;
      }
      pushToRedoArray({ bone, mode, value });
      return undoInfo;
    }
  };

  const resetRedoArray = () => {
    if (redoArray.length > 0) {
      _.forEach(redoArray, (item) => {
        redoArray.pop();
      });
    }
  };

  const pushToRedoArray = ({
    bone,
    mode,
    value,
  }: {
    bone: THREE.Bone;
    mode: string;
    value: any;
  }) => {
    redoArray.push({ bone, mode, value });
  };

  const popFromRedoArray = () => {
    if (redoArray.length !== 0) {
      const redoInfo = redoArray.pop();
      const { bone, mode } = redoInfo;
      let value;
      switch (mode) {
        case 'translate':
          value = {
            x: bone.position.x,
            y: bone.position.y,
            z: bone.position.z,
          };
          break;
        case 'rotate':
          value = {
            x: bone.quaternion.x,
            y: bone.quaternion.y,
            z: bone.quaternion.z,
            w: bone.quaternion.w,
          };
          break;
        case 'scale':
          value = {
            x: bone.scale.x,
            y: bone.scale.y,
            z: bone.scale.z,
          };
          break;
        default:
          break;
      }
      pushToUndoArray({ bone, mode, value });
      return redoInfo;
    }
  };

  return {
    pushToUndoArray,
    popFromUndoArray,
    resetRedoArray,
    popFromRedoArray,
  };
};
