import { find } from 'lodash';
import { select, call, put } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { RequestNodeResponse, CreateFolderOrMocapBodyData } from 'types/LP';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as api from 'api';
import { TOOL_PAYMENT_MAXIMUM_SIZE } from 'errors';
import PlanManager from 'utils/PlanManager';

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
  const { lpNode, user }: RootState = yield select();
  const { nodeId } = action.payload;

  try {
    const parentNode = find(lpNode.nodes, { id: nodeId });
    const data: CreateFolderOrMocapBodyData = {
      name: generateFolderName(lpNode.nodes, nodeId),
      type: 'DIRECTORY',
      data: [],
    };

    const res: RequestNodeResponse = yield call(api.createFolderOrMocap, lpNode.sceneId, data, parentNode?.id);
    const directoryNode = convertServerResponseToNode(res);
    const nodes = produce(lpNode.nodes, (draft) => {
      draft.push(directoryNode);
      if (directoryNode.parentId) {
        const parentNode = draft.find((node) => node.id === directoryNode.parentId);
        parentNode?.childNodeIds.push(directoryNode.id);
      }
    });

    yield put(lpNodeActions.addDirectoryAsync.success({ nodes, newDirectory: directoryNode }));
  } catch (e: any) {
    if (e.statusCode === TOOL_PAYMENT_MAXIMUM_SIZE) {
      PlanManager.openStorageExceededModal(user);
    }
    // yield put(lpNodeActions.addDirectoryAsync.failure(e));
  }
}
