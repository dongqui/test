import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

export default function* handleDeleteFolderOrMocap(action: ReturnType<typeof lpNodeActions.deleteFolderOrMocap>) {
  const { nodeId, parentId } = action.payload;
  const { lpNode }: RootState = yield select();

  const nextNodes = filterDeletedNode(lpNode.nodes, nodeId, parentId);
  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}
