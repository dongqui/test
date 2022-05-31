import { find, cloneDeep, omitBy } from 'lodash';
import { select, put, call } from 'redux-saga/effects';

import produce from 'immer';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { ServerAnimationLayerRequest, ServerAnimationRequest, ServerAnimationLayer, ServerAnimation } from 'types/common';
import { RequestNodeResponse } from 'types/LP';
import * as api from 'api';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { AnimationModule } from '3d/modules/animation/AnimationModule';

export default function* handleDuplicateMotion(action: ReturnType<typeof lpNodeActions.duplicateMotionAsync.request>) {
  const { plaskProject, lpNode }: RootState = yield select();
  const { nodeId } = action.payload;
  const motionNode = find(lpNode.nodes, { id: nodeId });
  const clone = cloneDeep(motionNode);

  if (!clone?.animation?.scenesLibraryModelAnimationLayers) {
    return;
  }

  // TODO: resolve ts
  // @ts-ignore
  const animationLayersWithoutUid: ServerAnimationLayerRequest[] = clone?.animation?.scenesLibraryModelAnimationLayers.map((layer) => omitBy(layer, (value, key) => key === 'uid'));
  // @ts-ignore
  const animationWithoutUid: ServerAnimationRequest = omitBy(clone?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers' || key === 'uid');
  // @ts-ignore
  const duplicatedMotionRes: RequestNodeResponse = yield call(api.postMotion, lpNode.sceneId, motionNode?.parentId, {
    animation: animationWithoutUid,
    animationLayer: animationLayersWithoutUid,
  });

  const duplicatedMotionNode = convertServerResponseToNode(duplicatedMotionRes);
  const asset = find(plaskProject.assetList, { id: clone.assetId });
  if (asset) {
    const animationLayers = duplicatedMotionNode?.animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
    const animation = omitBy(duplicatedMotionNode?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
    const animationIngredient = AnimationModule.serverDataToIngredient(animation, animationLayers, asset.transformNodes, false, asset.id);
    yield put(
      plaskProjectActions.addAnimationIngredient({
        assetId: asset.id,
        animationIngredientId: animationIngredient.id,
      }),
    );

    yield put(
      animationDataActions.addAnimationIngredient({
        animationIngredient: animationIngredient,
      }),
    );
  }

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const modelNode = find(draft, { id: motionNode?.parentId });
    modelNode?.childNodeIds.push(duplicatedMotionNode.id);

    draft.push(duplicatedMotionNode);
  });
  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
}
