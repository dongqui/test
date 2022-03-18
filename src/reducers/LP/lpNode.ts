import { Scene } from '@babylonjs/core';
import { ActionType, getType } from 'typesafe-actions';

import * as LPNodeActions from 'actions/LP/lpNodeAction';
interface State {
  nodes: LP.Node[];
  currentPath: string;
  currentPathId: string;
  clipboard: LP.Node[];
  selectedId: string | null;
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
  selectedAssetId: null,
  draggedNode: null,
  editingNodeId: null,

  // For test
  sceneId: 'q0j0y8dzoq9xmv7gn4n526ger3lkp1m6',
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
    case getType(LPNodeActions.getNodesAsync.success): {
      return Object.assign({}, state, {
        nodes: action.payload.nodes,
      });
    }
    case getType(LPNodeActions.addDirectoryAsdync.success): {
      return Object.assign({}, state, {
        nodes: [...state.nodes, action.payload],
      });
    }
    default: {
      return state;
    }
  }
};
