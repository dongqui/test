import { find } from 'lodash';
import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import plaskEngine from '3d/PlaskEngine';

export default function* handleDeleteMotion(action: ReturnType<typeof lpNodeActions.deleteMotion>) {
  const { lpNode, plaskProject, animationData }: RootState = yield select();
  const nodeId = action.payload;

  const targetMotion = find(lpNode.nodes, { id: nodeId });
  const asset = find(plaskProject.assetList, { id: targetMotion?.assetId });
  const targetAnimationIngredient = find(animationData.animationIngredients, { id: targetMotion?.animationId });
  if (asset && targetAnimationIngredient) {
    const isVisualizedAsset = plaskProject.visualizedAssetIds.includes(asset.id);
    if (isVisualizedAsset) {
      plaskEngine.assetModule.unvisualizeModel(asset.id);

      yield put(plaskProjectActions.unrenderAsset({}));
      yield put(selectingDataActions.unrenderAsset({ assetId: asset.id }));
    }
    yield put(animationDataActions.removeAnimationIngredient({ animationIngredientId: targetAnimationIngredient.id }));
    yield put(plaskProjectActions.removeAnimationIngredient({ assetId: asset.id, animationIngredientId: targetAnimationIngredient.id }));
  }

  if (targetMotion) {
    const nextNodes = filterDeletedNode(lpNode.nodes, targetMotion);
    yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
    forceClickAnimationPlayAndStop();
  }
}
