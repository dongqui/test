import { select, put, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';

import { RootState } from 'reducers';
import { filterDeletedNode, getDescendantNodes } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

function* handleDeleteNodeRequest(action: ReturnType<typeof lpNodeActions.deleteNodeSocket.request>) {
  const { lpNode }: RootState = yield select();
  const nodeId = action.payload;
  const descendantIds = getDescendantNodes(lpNode.nodes, nodeId).map((node) => node.id);

  yield put(
    lpNodeActions.deleteNodeSocket.send({
      type: 'delete',
      scenesLibraryId: nodeId,
      data: {
        descendantIds,
      },
    }),
  );
}

function* handleDeleteNodeReceive(action: ReturnType<typeof lpNodeActions.deleteNodeSocket.receive>) {
  const { lpNode }: RootState = yield select();
  const targetNode = _.find(lpNode.nodes, { id: action.payload.scenesLibraryId });

  if (!targetNode) {
    return;
  }

  if (targetNode.type === 'MODEL' && targetNode.assetId) {
    yield put(lpNodeActions.deleteModel({ nodeId: targetNode.id, assetId: targetNode.assetId }));
  } else if (targetNode.type === 'MOTION' && targetNode.assetId) {
    yield put(lpNodeActions.deleteMotion(targetNode.id));
  } else {
    const nextNodes = filterDeletedNode(lpNode.nodes, targetNode);
    yield put(lpNodeActions.deleteNodeSocket.update(nextNodes));
  }
}

export default function* watchdeleteNodeSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.deleteNodeSocket.request), handleDeleteNodeRequest),
    takeLatest(getType(lpNodeActions.deleteNodeSocket.receive), handleDeleteNodeReceive),
  ]);
}
