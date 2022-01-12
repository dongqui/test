import { LPNodeAction } from 'actions/LP/lpNodeAction';
import LP from '../../../@types/Container/LP';

interface State {
  nodes: LP.Node[];
  visualizedfileUrl: string | File;
  currentPath: string;
  currentPathId: string;
  clipboard: LP.Node[];
  selectedId: string | null;
  selectedAssetId: string | null;
  draggedNode: LP.Node | null;
}

const defaultState: State = {
  nodes: [],
  visualizedfileUrl: '',
  currentPath: '\\root',
  currentPathId: '\\root',
  clipboard: [],
  selectedId: null,
  selectedAssetId: null,
  draggedNode: null,
};

export const lpNode = (state = defaultState, action: LPNodeAction) => {
  switch (action.type) {
    case 'node/CHANGE_NODE': {
      return Object.assign({}, state, {
        nodes: action.payload.nodes,
      });
    }
    case 'node/VISUALIZE': {
      return Object.assign({}, state, {
        visualizedfileUrl: action.payload,
      });
    }
    case 'node/CHANGE_CURRENT_PATH': {
      return Object.assign({}, state, {
        currentPath: action.payload.currentPath,
        cdrrentPathId: action.payload.id,
      });
    }
    case 'node/CHANGE_CLIPBOARD': {
      return Object.assign({}, state, {
        clipboard: action.payload.data,
      });
    }
    case 'node/SELECT_NODE': {
      return Object.assign({}, state, {
        selectedId: action.payload.nodeId,
        selectedAssetId: action.payload.assetId,
      });
    }
    default: {
      return state;
    }
  }
};
