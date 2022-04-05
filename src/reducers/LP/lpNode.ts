import { LPNodeAction } from 'actions/LP/lpNodeAction';
import { getDescendantNodes } from 'utils/LP/FileSystem';
interface State {
  nodes: LP.Node[];
  visualizedfileUrl: string | File;
  currentPath: string;
  currentPathId: string;
  clipboard: LP.Node[];
  selectedId: string | null;
  selectedNodeDescendants: LP.Node[];
  selectedAssetId: string | null;
  draggedNode: LP.Node | null;
  editingNodeId: null | string;
}

const defaultState: State = {
  nodes: [],
  visualizedfileUrl: '',
  currentPath: '\\root',
  currentPathId: '\\root',
  clipboard: [],
  selectedId: null,
  selectedNodeDescendants: [],
  selectedAssetId: null,
  draggedNode: null,
  editingNodeId: null,
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
        selectedNodeDescendants: getDescendantNodes(state.nodes, action.payload.nodeId || ''),
      });
    }
    case 'node/SET_DRAGGED_NODE': {
      return Object.assign({}, state, {
        draggedNode: action.payload.node,
      });
    }
    case 'node/SET_EDITING_NODE_ID': {
      return Object.assign({}, state, {
        editingNodeId: action.payload.nodeId,
      });
    }
    case 'node/ADD_NODES': {
      return Object.assign({}, state, {
        nodes: [...state.nodes, ...action.payload.nodes],
      });
    }

    default: {
      return state;
    }
  }
};
