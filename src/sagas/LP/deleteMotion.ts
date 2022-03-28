import { find } from 'lodash';
import { select, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import { RootState } from 'reducers';
import { removeAssetThingsFromScene } from 'utils/RP';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';

// export default function* handleDeleteMotion(action: ReturnType<typeof lpNodeActions.deleteMotion>) {
//   const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();
//   const nodeId = action.payload;

//   const targetMotion = find(lpNode.nodes, { id: nodeId });
//   const asset = find(plaskProject.assetList, { id: targetMotion?.assetId });
//   const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.id });

//   if (!targetMotion || !asset || !targetAnimationIngredient) {
//     return;
//   }

//   const isVisualizedAsset = plaskProject.visualizedAssetIds.includes(asset.id);
//   if (isVisualizedAsset) {
//     removeAssetThingsFromScene(plaskProject, selectingData.present, asset.id);

//     yield put(plaskProjectActions.unrenderAsset({}));
//     yield put(selectingDataActions.unrenderAsset({ assetId: asset.id }));
//   }

//   const nextNodes = filterDeletedNode(lpNode.nodes, targetMotion);

//   yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
//   yield put(animationDataActions.removeAnimationIngredient({ animationIngredientId: targetAnimationIngredient.id }));
//   yield put(plaskProjectActions.removeAnimationIngredient({ assetId: asset.id, animationIngredientId: targetAnimationIngredient.id }));
//   forceClickAnimationPlayAndStop();
// }

function* handeDeleteMotionRequest(action: ReturnType<typeof lpNodeActions.deleteMotionSocket.request>) {
  const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();
  const motionId = action.payload;

  const targetMotion = find(lpNode.nodes, { id: motionId });
  const asset = find(plaskProject.assetList, { id: targetMotion?.assetId });
  const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.id });

  if (!targetMotion || !asset || !targetAnimationIngredient) {
    return;
  }

  yield put(lpNodeActions.deleteMotionSocket.send(motionId));
}
function handeDeleteMotionSend(action: ReturnType<typeof lpNodeActions.deleteMotionSocket.send>) {
  // socket.emit('animation', {
  //   type: 'delete',
  //   data: {
  //     animationId: action.payload,
  //   },
  // });
}
function* handeDeleteMotionReceive(action: ReturnType<typeof lpNodeActions.deleteMotionSocket.receive>) {
  const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();

  const motionId = action.payload.data.animationId;
  const targetMotion = find(lpNode.nodes, { id: motionId });

  const asset = find(plaskProject.assetList, { id: targetMotion?.assetId });
  const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.id });

  if (!targetMotion || !asset || !targetAnimationIngredient) {
    return;
  }

  const isVisualizedAsset = plaskProject.visualizedAssetIds.includes(asset.id);
  if (isVisualizedAsset) {
    removeAssetThingsFromScene(plaskProject, selectingData.present, asset.id);

    yield put(plaskProjectActions.unrenderAsset({}));
    yield put(selectingDataActions.unrenderAsset({ assetId: asset.id }));
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetMotion);

  yield put(lpNodeActions.deleteMotionSocket.update(nextNodes));
  yield put(animationDataActions.removeAnimationIngredient({ animationIngredientId: targetAnimationIngredient.id }));
  yield put(plaskProjectActions.removeAnimationIngredient({ assetId: asset.id, animationIngredientId: targetAnimationIngredient.id }));
  forceClickAnimationPlayAndStop();
}

export default function* watchDeleteMotionSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.deleteMotionSocket.request), handeDeleteMotionRequest),
    takeLatest(getType(lpNodeActions.deleteMotionSocket.send), handeDeleteMotionSend),
    takeLatest(getType(lpNodeActions.deleteMotionSocket.receive), handeDeleteMotionReceive),
  ]);
}
