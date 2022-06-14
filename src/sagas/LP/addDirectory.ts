import { find } from 'lodash';
import { select, call, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { RequestNodeResponse, CreateFolderOrMocapBodyData } from 'types/LP';
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

export default function* handleAddDirectory(action: ReturnType<typeof lpNodeActions.addDirectoryAsync.request>) {
  const { lpNode }: RootState = yield select();
  const { nodeId } = action.payload;

  try {
    const parentNode = find(lpNode.nodes, { id: nodeId });
    const data: CreateFolderOrMocapBodyData = {
      name: generateFolderName(lpNode.nodes, nodeId),
      type: 'DIRECTORY',
      data: [],
    };

    const res: RequestNodeResponse = yield call(api.createFolderOrMocap, lpNode.sceneId, data, parentNode?.id);
    yield put(lpNodeActions.addDirectoryAsync.success(convertServerResponseToNode(res)));
  } catch (e) {
    // yield put(lpNodeActions.addDirectoryAsync.failure(e));
  }
}
