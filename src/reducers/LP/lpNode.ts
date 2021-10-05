import { LPNodeAction } from 'actions/LP/lpNodeAction';
import { v4 as uuidv4 } from 'uuid';

interface State {
  node: LP.Node[];
  visualizedFileURL: string | File;
  currentPath: string;
  currentPathId: string;
}

const defaultState: State = {
  node: [
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileURL: '/models/Zombie.glb',
      name: 'Zombie.glb',
      type: 'Model',
      children: [],
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileURL: '/models/Knight.glb',
      name: 'Knight.glb',
      type: 'Model',
      children: [],
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileURL: '/models/Vanguard.glb',
      name: 'Vanguard.glb',
      type: 'Model',
      children: [],
    },
  ],
  visualizedFileURL: '',
  currentPath: '\\root',
  currentPathId: '\\root',
};

export const lpNode = (state = defaultState, action: LPNodeAction) => {
  switch (action.type) {
    case 'mode/CHANGE_NODE': {
      return Object.assign({}, state, {
        node: action.payload.nodes,
      });
    }
    case 'mode/VISUALIZE': {
      return Object.assign({}, state, {
        visualizedFileURL: action.payload,
      });
    }
    case 'mode/CHANGE_CURRENT_PATH': {
      return Object.assign({}, state, {
        currentPath: action.payload.currentPath,
        currentPathId: action.payload.id,
      });
    }
    default: {
      return state;
    }
  }
};
