import _ from 'lodash';

type TargetPanel = 'RP' | 'TP';

interface RPValue {
  bone: THREE.Bone;
  position: { x: number; y: number; z: number };
  quaternion: { x: number; y: number; z: number; w: number };
  scale: { x: number; y: number; z: number };
}

interface HistoryItem {
  panel: TargetPanel;
  value: RPValue;
}

export const useHistory = () => {
  const undoArray: HistoryItem[] = [];
  const redoArray: HistoryItem[] = [];

  const pushToUndoArray = ({ panel, value }: { panel: TargetPanel; value: RPValue }) => {
    undoArray.push({ panel, value });
  };

  const popFromUndoArray = () => {
    if (undoArray.length !== 0) {
      const undoInfo = undoArray.pop();
      if (!undoInfo) {
        return;
      }
      const { panel, value } = undoInfo;
      const { bone } = value;
      if (panel === 'RP') {
        pushToRedoArray({
          panel,
          value: {
            bone,
            position: {
              x: bone.position.x,
              y: bone.position.y,
              z: bone.position.z,
            },
            quaternion: {
              x: bone.quaternion.x,
              y: bone.quaternion.y,
              z: bone.quaternion.z,
              w: bone.quaternion.w,
            },
            scale: {
              x: bone.scale.x,
              y: bone.scale.y,
              z: bone.scale.z,
            },
          },
        });
      }
      return undoInfo;
    }
  };

  const pushToRedoArray = ({ panel, value }: { panel: TargetPanel; value: RPValue }) => {
    redoArray.push({ panel, value });
  };

  const popFromRedoArray = () => {
    if (redoArray.length !== 0) {
      const redoInfo = redoArray.pop();
      if (!redoInfo) {
        return;
      }
      const { panel, value } = redoInfo;
      const { bone } = value;
      if (panel === 'RP') {
        pushToUndoArray({
          panel,
          value: {
            bone,
            position: {
              x: bone.position.x,
              y: bone.position.y,
              z: bone.position.z,
            },
            quaternion: {
              x: bone.quaternion.x,
              y: bone.quaternion.y,
              z: bone.quaternion.z,
              w: bone.quaternion.w,
            },
            scale: {
              x: bone.scale.x,
              y: bone.scale.y,
              z: bone.scale.z,
            },
          },
        });
      }
      return redoInfo;
    }
  };

  return {
    pushToUndoArray,
    popFromUndoArray,
    pushToRedoArray,
    popFromRedoArray,
  };
};
