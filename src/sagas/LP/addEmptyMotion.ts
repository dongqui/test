import { find, omitBy } from 'lodash';
import { select, put, take, call } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import plaskEngine from '3d/PlaskEngine';
import { RequestNodeResponse } from 'types/LP';
import * as api from 'api';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { ServerAnimationLayer, ServerAnimation } from 'types/common';

export default function* handleAddEmptyMotion(action: ReturnType<typeof lpNodeActions.addEmptyMotionAsync.request>) {
  const { plaskProject, lpNode }: RootState = yield select();
  const { assetId, nodeId } = action.payload;
  const modelNode = find(lpNode.nodes, { id: nodeId });

  if (!modelNode) {
    return;
  }

  const _asset = find(plaskProject.assetList, { id: assetId });
  if (!_asset) {
    yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode));
    yield take('ADDED_NEW_ASSET');
  }

  const newState: RootState = yield select();
  const asset = _asset || find(newState.plaskProject.assetList, { id: assetId });

  if (!asset) {
    return;
  }

  const animationIngredientCurrent = modelNode?.childNodeIds.length === 0;
  const rawAnimationIngredient = plaskEngine.animationModule.createAnimationIngredient(assetId, 'empty motion', [], asset?.transformNodes, false, animationIngredientCurrent);
  const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(rawAnimationIngredient, 30, false);
  const motionRes: RequestNodeResponse = yield call(api.postMotion, lpNode.sceneId, modelNode.id, {
    animation: serverAnimation,
    animationLayer: serverAnimationLayers,
  });
  const motionNode = convertServerResponseToNode(motionRes);

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const parentModelNode = find(draft, { id: motionNode.parentId });
    parentModelNode?.childNodeIds.push(motionNode.id);
    draft.push(motionNode);
  });
  yield put(
    lpNodeActions.changeNode({
      nodes: nextNodes,
    }),
  );

  const animationLayers = motionNode?.animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
  const animation = omitBy(motionNode?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
  const animationIngredient = AnimationModule.serverDataToIngredient(animation, animationLayers, asset.transformNodes, false, asset.id);
  yield put(
    animationDataActions.addAnimationIngredient({
      animationIngredient,
    }),
  );

  yield put(
    plaskProjectActions.addAnimationIngredient({
      assetId,
      animationIngredientId: animationIngredient.id,
    }),
  );
  forceClickAnimationPlayAndStop();

  yield put({ type: 'ADDED_EMPTY_MOTION' });
}
