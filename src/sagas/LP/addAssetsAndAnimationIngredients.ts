import { ServerAnimation } from './../../types/common/index';
import { RootState } from 'reducers';
import { select, put, call, all, putResolve } from 'redux-saga/effects';
import { omitBy, find } from 'lodash';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import { getFileExtension, filterAnimatableTransformNodes } from 'utils/common';
import { getInitialPoses } from 'utils/RP';
import { PlaskAsset, ServerAnimationLayer } from 'types/common';
import plaskEngine from '3d/PlaskEngine';
import * as api from 'api';
import { ServerAnimationResponse } from 'types/common';

// After put this action, have to call yield take('ADDED_NEW_ASSET'); .
export default function* addAssetsAndAnimationIngredients(action: ReturnType<typeof lpNodeActions.addAssetsAndAnimationIngredients>) {
  const { plaskProject, lpNode }: RootState = yield select();
  const baseScene = plaskProject.screenList[0].scene;
  const { modelNode, motionNodeId } = action.payload;

  if (!modelNode.assetId) {
    return;
  }

  modelNode.modelUrl = '/models/Knight.glb';
  const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], modelNode.modelUrl || '', '', baseScene);
  const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
  animationGroups.forEach((animationGroup, idx) => {
    // block auto play when loading assets
    // @TODO need to find better ways to block
    animationGroup.pause();
  });

  plaskEngine.assetModule.preprocessAssetContainerData(modelNode.assetId, assetContainer);

  const newAsset: PlaskAsset = {
    id: modelNode.assetId,
    name: modelNode.name,
    extension: getFileExtension(modelNode.name).toLowerCase(),
    meshes,
    initialPoses: getInitialPoses(transformNodes, skeletons),
    geometries,
    skeleton: skeletons[0] ?? null,
    bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
    transformNodes,
    animationIngredientIds: motionNodeId ? [find(lpNode.nodes, { id: motionNodeId })?.animationId!] : [],
    retargetMapId: modelNode.id,
  };

  if (motionNodeId) {
    const motion = find(lpNode.nodes, { id: motionNodeId });
    const _animation: ServerAnimationResponse = yield call(api.getAnimation, motion?.animationId!);
    const animationLayers = _animation.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
    const animation = omitBy(_animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;

    let { animationIngredient } = plaskEngine.animationModule.serverDataToIngredient(animation, animationLayers, newAsset.transformNodes, false, motion?.assetId!);

    const animationIngredients = [animationIngredient];

    yield put(
      animationDataActions.addAsset({
        transformNodes: filterAnimatableTransformNodes(transformNodes),
        animationIngredients,
        retargetMap: {
          id: modelNode.id,
          assetId: modelNode.assetId,
          ...modelNode.retargetMap!,
        },
      }),
    );
  } else {
    yield put(
      animationDataActions.addAsset({
        transformNodes: filterAnimatableTransformNodes(transformNodes),
        animationIngredients: [],
        retargetMap: {
          id: modelNode.id,
          assetId: modelNode.assetId,
          ...modelNode.retargetMap!,
        },
      }),
    );
  }

  yield put(plaskProjectActions.addAsset({ asset: newAsset }));

  // temporal code
  yield put({ type: 'ADDED_NEW_ASSET' });
}
