import { find, filter } from 'lodash';
import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { goToSpecificPoses } from 'utils/RP';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as animationDataActions from 'actions/animationDataAction';
import plaskEngine from '3d/PlaskEngine';

export default function* handleVisualizeMotion(action: ReturnType<typeof lpNodeActions.visualizeMotion>) {
  const { plaskProject, animationData, lpNode }: RootState = yield select();
  const { animationIngredients } = animationData;
  const { screenList, assetList } = plaskProject;
  const { assetId, nodeId, parentId } = action.payload;

  plaskEngine.assetModule.clearAnimationGroups(screenList);
  const parentModel = find(lpNode.nodes, { id: parentId });

  if (!assetId || !parentModel) {
    return;
  }

  // TODO: 애니메이션 node 조회시 animation ingredients에 넣어야할듯.
  const motions = filter(animationIngredients, { assetId: parentModel.assetId });
  if (motions && parentModel.assetId) {
    const selectedMotion = find(motions, { id: nodeId });
    if (selectedMotion) {
      const currentAsset = assetList.find((asset) => asset.id === parentModel.assetId);
      if (currentAsset) {
        goToSpecificPoses(currentAsset.initialPoses);
      }

      yield put(
        animationDataActions.changeCurrentAnimationIngredient({
          assetId: parentModel.assetId,
          animationIngredientId: selectedMotion.id,
        }),
      );
    }
  }

  yield put(lpNodeActions.visualizeModel(parentModel));
  forceClickAnimationPlayAndStop(50);
}
