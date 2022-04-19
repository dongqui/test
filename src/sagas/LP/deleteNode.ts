import { select, put, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';

import { RootState } from 'reducers';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';

function* handleDeleteNodeRequest(action: ReturnType<typeof lpNodeActions.deleteNodeSocket.request>) {
  const nodeId = action.payload;
  yield put(
    lpNodeActions.deleteNodeSocket.send({
      type: 'delete',
      scenesLibraryId: nodeId,
    }),
  );
}

function* handleDeleteNodeReceive(action: ReturnType<typeof lpNodeActions.deleteNodeSocket.receive>) {
  const { lpNode, plaskProject, selectingData }: RootState = yield select();
  const targetNode = _.find(lpNode.nodes, { id: action.payload.scenesLibraryId });

  if (!targetNode) {
    return;
  }

  if (targetNode.type === 'Model' && targetNode.assetId) {
    yield put(plaskProjectActions.removeAsset({ assetId: targetNode?.assetId }));
    yield put(animationDataActions.removeAsset({ assetId: targetNode?.assetId }));
    yield put(selectingDataActions.unrenderAsset({ assetId: targetNode?.assetId }));

    forceClickAnimationPlayAndStop();
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetNode);
  yield put(lpNodeActions.deleteNodeSocket.update(nextNodes));
}

export default function* watchdeleteNodeSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.deleteNodeSocket.request), handleDeleteNodeRequest),
    takeLatest(getType(lpNodeActions.deleteNodeSocket.receive), handleDeleteNodeReceive),
  ]);
}
