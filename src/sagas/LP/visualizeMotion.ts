import { find } from 'lodash';
import { select, put, take } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import plaskEngine from '3d/PlaskEngine';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { goToSpecificPoses } from 'utils/RP';

export default function* handleVisualizeMotion(action: ReturnType<typeof lpNodeActions.visualizeMotion>) {
  const { plaskProject, lpNode }: RootState = yield select();
  const { screenList, assetList } = plaskProject;
  const { assetId, nodeId, parentId } = action.payload;

  plaskEngine.assetModule.clearAnimationGroups(screenList);
  const modelNode = find(lpNode.nodes, { id: parentId });

  if (!assetId || !modelNode) {
    return;
  }

  const asset = find(assetList, { id: modelNode.assetId });
  if (!asset) {
    yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode));
    yield take('ADDED_NEW_ASSET');
  }

  const newRootState: RootState = yield select();
  const motionNode = find(lpNode.nodes, { id: nodeId });
  const targetAnimationIngredient = find(newRootState.animationData.animationIngredients, { id: motionNode?.animation?.uid });
  const currentAsset = assetList.find((asset) => asset.id === modelNode.assetId);
  if (currentAsset) {
    goToSpecificPoses(currentAsset.initialPoses);
  }

  if (!targetAnimationIngredient?.id || !modelNode.assetId) {
    return;
  }

  yield put(
    animationDataActions.changeCurrentAnimationIngredient({
      assetId: modelNode.assetId,
      animationIngredientId: targetAnimationIngredient.id,
    }),
  );
  yield put(lpNodeActions.visualizeModel(modelNode, targetAnimationIngredient.id));
  forceClickAnimationPlayAndStop(50);
}
