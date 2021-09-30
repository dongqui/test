import { LPNodeAction } from 'actions/LP/lpNodeAction';
import { v4 as uuidv4 } from 'uuid';

interface State {
  node: LP.Node[];
  visualizedFileURL: string | File;
  currentPath: string;
}

const defaultState: State = {
  node: [
    {
      id: uuidv4(),
      filePath: '\\root',
      fileURL: '/models/Zombie.glb',
      name: 'Zombie.glb',
      type: 'Model',
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      fileURL: '/models/Knight.glb',
      name: 'Knight.glb',
      type: 'Model',
    },
    {
      id: uuidv4(),
      filePath: '\\root',
      fileURL: '/models/Vanguard.glb',
      name: 'Vanguard.glb',
      type: 'Model',
    },
  ],
  visualizedFileURL: '',
  currentPath: '\\root',
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
        currentPath: action.payload,
      });
    }
    default: {
      return state;
    }
  }
};
