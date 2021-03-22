import * as THREE from 'three';
import _ from 'lodash';
import { useEffect, useMemo } from 'react';

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
      pushToRedoArray({ panel, value });
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
      pushToUndoArray({ panel, value });
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
