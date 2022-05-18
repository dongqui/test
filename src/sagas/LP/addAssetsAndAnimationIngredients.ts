import { ServerAnimation } from './../../types/common/index';
import { RootState } from 'reducers';
import { select, put, call } from 'redux-saga/effects';
import { omitBy, find } from 'lodash';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as BABYLON from '@babylonjs/core';
import { getFileExtension, filterAnimatableTransformNodes } from 'utils/common';
import { getInitialPoses } from 'utils/RP';
import { PlaskAsset, ServerAnimationLayer } from 'types/common';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import plaskEngine from '3d/PlaskEngine';

export default function* addAssetsAndAnimationIngredients(action: ReturnType<typeof lpNodeActions.addAssetsAndAnimationIngredients>) {
  const { plaskProject, lpNode }: RootState = yield select();
  const baseScene = plaskProject.screenList[0].scene;
  const modelNode = action.payload;

  if (!modelNode.assetId) {
    return;
  }

  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));
    const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], modelNode.modelUrl || '', '', baseScene);
    const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
    animationGroups.forEach((animationGroup, idx) => {
      // block auto play when loading assets
      // @TODO need to find better ways to block
      animationGroup.pause();
    });

    plaskEngine.assetModule.preprocessAssetContainerData(modelNode.assetId, assetContainer);

    const motionNodes = modelNode.childNodeIds.map((id) => find(lpNode.nodes, { id }));
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
      animationIngredientIds: motionNodes.map((motion) => motion?.animation?.uid!),
      retargetMapId: modelNode.id,
    };

    const animationIngredients = modelNode.childNodeIds.map((id) => {
      const motion = find(lpNode.nodes, { id });

      const animationLayers = motion?.animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
      const animation = omitBy(motion?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
      return AnimationModule.serverDataToIngredient(animation, animationLayers, newAsset.transformNodes, false, motion?.assetId!);
    });

    yield put(plaskProjectActions.addAsset({ asset: newAsset }));
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
    yield put({ type: 'ADDED_NEW_ASSET' });
  } catch (e) {
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}
