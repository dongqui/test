import { LPNodeAction } from 'actions/LP/lpNodeAction';
import { v4 as uuidv4 } from 'uuid';

interface State {
  node: LP.Node[];
  visualizedfileUrl: string | File;
  currentPath: string;
  currentPathId: string;
  clipboard: LP.Node[];
}

const defaultState: State = {
  node: [
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileUrl: '/models/Zombie.glb',
      name: 'Zombie.glb',
      extension: 'glb',
      type: 'Model',
      children: [],
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileUrl: '/models/Knight.glb',
      name: 'Knight.glb',
      extension: 'glb',
      type: 'Model',
      children: [],
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      parentId: '__root__',
      fileUrl: '/models/Vanguard.glb',
      name: 'Vanguard.glb',
      extension: 'glb',
      type: 'Model',
      children: [],
    },
  ],
  visualizedfileUrl: '',
  currentPath: '\\root',
  currentPathId: '\\root',
  clipboard: [],
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
        visualizedfileUrl: action.payload,
      });
    }
    case 'mode/CHANGE_CURRENT_PATH': {
      return Object.assign({}, state, {
        currentPath: action.payload.currentPath,
        currentPathId: action.payload.id,
      });
    }
    case 'mode/CHANGE_CLIPBOARD': {
      return Object.assign({}, state, {
        clipboard: action.payload.data,
      });
    }
    default: {
      return state;
    }
  }
};
