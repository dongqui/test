import { select, put, takeLatest, all } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';

import { RootState } from 'reducers';
import { removeAssetThingsFromScene } from 'utils/RP';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';

// export default function* handleDeleteModel(action: ReturnType<typeof lpNodeActions.deleteModel>) {
//   const { nodeId, assetId } = action.payload;
//   const { lpNode, plaskProject, selectingData }: RootState = yield select();
//   const targetModel = _.find(lpNode.nodes, { id: nodeId });

//   if (!targetModel) {
//     return;
//   }
//   removeAssetThingsFromScene(plaskProject, selectingData, assetId);

//   const nextNodes = filterDeletedNode(lpNode.nodes, targetModel);

//   yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
//   yield put(plaskProjectActions.removeAsset({ assetId }));
//   yield put(animationDataActions.removeAsset({ assetId }));
//   yield put(selectingDataActions.unrenderAsset({ assetId }));
//   forceClickAnimationPlayAndStop();
// }

function* handleDeleteModelRequest(action: ReturnType<typeof lpNodeActions.deleteModelSocket.request>) {
  const { lpNode, plaskProject, selectingData }: RootState = yield select();
  const targetModel = _.find(lpNode.nodes, { id: action.payload });

  if (!targetModel?.assetId) {
    return;
  }

  removeAssetThingsFromScene(plaskProject, selectingData, targetModel.assetId);
  yield put(plaskProjectActions.removeAsset({ assetId: targetModel?.assetId }));
  yield put(animationDataActions.removeAsset({ assetId: targetModel?.assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId: targetModel?.assetId }));
  yield put(lpNodeActions.deleteModelSocket.send(action.payload));

  forceClickAnimationPlayAndStop();
}

function* handleDeleteModelSend(action: ReturnType<typeof lpNodeActions.deleteModelSocket.send>) {
  // Socket.emit('library', {
  //   type: 'delete',
  //   scenesLibraryId: action.payload,
  // })
}

function* handleDeleteModelReceive(action: ReturnType<typeof lpNodeActions.deleteModelSocket.receive>) {
  const { lpNode }: RootState = yield select();
  const targetModel = _.find(lpNode.nodes, { id: action.payload.scenesLibraryId });

  if (!targetModel?.assetId) {
    return;
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetModel);

  yield put(lpNodeActions.deleteModelSocket.update(nextNodes));
}

export default function* watchDeleteModelSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.deleteModelSocket.request), handleDeleteModelRequest),
    takeLatest(getType(lpNodeActions.deleteModelSocket.send), handleDeleteModelSend),
    takeLatest(getType(lpNodeActions.deleteModelSocket.receive), handleDeleteModelReceive),
  ]);
}
