import { find } from 'lodash';
import { select, call, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { checkCreateDuplicates, createFolderNode } from 'utils/LP/FileSystem';
import { CreateFolderOrMocapResponse, CreateFolderOrMocapBodyData } from 'types/LP';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as api from 'api';

function generateFolderName(nodes: LP.Node[], nodeId: string) {
  const currentPathNodeName = nodes
    .filter((node) => {
      if (node.parentId === nodeId) {
        if (node.name.includes('Untitled')) {
          return true;
        }
        return false;
      }
    })
    .map((filteredNode) => filteredNode.name);

  const check = checkCreateDuplicates('Untitled', currentPathNodeName);

  const nodeName = check === '0' ? 'Untitled' : `Untitled (${check})`;

  return nodeName;
}

export default function* handleAddDirectory(action: ReturnType<typeof lpNodeActions.addDirectoryAsdync.request>) {
  const { lpNode }: RootState = yield select();
  const { nodeId, filePath } = action.payload;

  try {
    const parentNode = find(lpNode.nodes, { id: nodeId });
    const data: CreateFolderOrMocapBodyData = {
      name: generateFolderName(lpNode.nodes, nodeId),
      type: 'FOLDER',
      data: [],
    };

    const res: CreateFolderOrMocapResponse = yield call(api.createFolderOrMocap, lpNode.sceneId, data, parentNode?.id);
    yield put(lpNodeActions.addDirectoryAsdync.success(createFolderNode(res.name, filePath, res.parentUid)));
  } catch (e) {
    // yield put(lpNodeActions.addDirectoryAsdync.failure(e));
  }
}
