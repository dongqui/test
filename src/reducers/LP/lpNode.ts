import { ActionType, getType } from 'typesafe-actions';

import * as LPNodeActions from 'actions/LP/lpNodeAction';
import { getDescendantNodes } from 'utils/LP/FileSystem';
interface State {
  nodes: LP.Node[];
  currentPath: string;
  currentPathId: string;
  clipboard: LP.Node[];
  selectedId: string | null;
  selectedNodeDescendants: LP.Node[];
  selectedAssetId: string | null;
  draggedNode: LP.Node | null;
  editingNodeId: null | string;
  sceneId: string;
}

const defaultState: State = {
  nodes: [],
  currentPath: '\\root',
  currentPathId: '\\root',
  clipboard: [],
  selectedId: null,
  selectedNodeDescendants: [],
  selectedAssetId: null,
  draggedNode: null,
  editingNodeId: null,

  // For test
  sceneId: 'ezl1xkrzgyd8n64dm4p9q2o03em5jv6j',
};

export const lpNode = (state = defaultState, action: ActionType<typeof LPNodeActions>) => {
  switch (action.type) {
    case 'node/CHANGE_NODE': {
      return Object.assign({}, state, {
        nodes: action.payload.nodes,
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
    case getType(LPNodeActions.addDirectoryAsync.success): {
      return Object.assign({}, state, {
        nodes: [...state.nodes, action.payload],
      });
    }
    case getType(LPNodeActions.getNodesAsync.success):
    case getType(LPNodeActions.addModelAsync.success):
    case getType(LPNodeActions.moveNodeSocket.update):
    case getType(LPNodeActions.editNodeNameSocket.update):
    case getType(LPNodeActions.deleteNodeSocket.update): {
      return Object.assign({}, state, {
        nodes: action.payload,
      });
    }
    default: {
      return state;
    }
  }
};
