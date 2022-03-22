import { select, put, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';

import { RootState } from 'reducers';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

function* handleDeleteFolderOrMocapRequest(action: ReturnType<typeof lpNodeActions.deleteFolderOrMocapSocket.request>) {
  const nodeId = action.payload;
  yield put(lpNodeActions.deleteFolderOrMocapSocket.send(nodeId));
}

function* handleDeleteFolderOrMocapSend(action: ReturnType<typeof lpNodeActions.deleteFolderOrMocapSocket.send>) {
  // Socket.emit('library', {
  //   type: 'delete',
  //   scenesLibraryId: action.payload,
  // })
}

function* handleDeleteFolderOrMocapReceive(action: ReturnType<typeof lpNodeActions.deleteFolderOrMocapSocket.receive>) {
  const { lpNode }: RootState = yield select();
  const targetNode = _.find(lpNode.nodes, { id: action.payload.scenesLibraryId });

  if (!targetNode) {
    return;
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetNode);
  yield put(lpNodeActions.deleteFolderOrMocapSocket.update(nextNodes));
}

export default function* waitDeleteFolderOrMocapSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.deleteFolderOrMocapSocket.request), handleDeleteFolderOrMocapRequest),
    takeLatest(getType(lpNodeActions.deleteFolderOrMocapSocket.send), handleDeleteFolderOrMocapSend),
    takeLatest(getType(lpNodeActions.deleteFolderOrMocapSocket.receive), handleDeleteFolderOrMocapReceive),
  ]);
}
