import { find } from 'lodash';
import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { removeAssetThingsFromScene } from 'utils/RP';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';

export default function* handleDeleteMotion(action: ReturnType<typeof lpNodeActions.deleteMotion>) {
  const { lpNode, plaskProject, animationData, selectingData }: RootState = yield select();
  const { nodeId, assetId, parentId } = action.payload;

  const targetMotion = find(lpNode.nodes, { id: nodeId });
  const asset = find(plaskProject.assetList, { id: assetId });
  const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.id });

  if (!targetMotion || !asset || !targetAnimationIngredient) {
    return;
  }

  const isVisualizedAsset = plaskProject.visualizedAssetIds.includes(assetId);
  if (isVisualizedAsset) {
    removeAssetThingsFromScene(plaskProject, selectingData, assetId);

    yield put(plaskProjectActions.unrenderAsset({}));
    yield put(selectingDataActions.unrenderAsset({ assetId }));
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetMotion);

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(animationDataActions.removeAnimationIngredient({ animationIngredientId: targetAnimationIngredient.id }));
  yield put(plaskProjectActions.removeAnimationIngredient({ assetId: assetId, animationIngredientId: targetAnimationIngredient.id }));
  forceClickAnimationPlayAndStop();
}
