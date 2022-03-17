import { find } from 'lodash';
import { select, put } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import { checkCreateDuplicates, createFolderNode } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

export default function* handleAddDirectory(action: ReturnType<typeof lpNodeActions.addDirectory>) {
  const { lpNode }: RootState = yield select();
  const { nodeId, filePath, extension } = action.payload;

  const currentPathNodeName = lpNode.nodes
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

  lpNodeActions.createFolderOrMocapAsync;

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const parent = find(draft, { id: nodeId });
    const newFolderNode = createFolderNode(nodeName, filePath, extension, parent?.id);
    if (parent) {
      parent.childNodeIds.push(newFolderNode.id);
    }
    draft.push(newFolderNode);
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}
