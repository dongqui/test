import { find, filter, omitBy } from 'lodash';
import { select, put, call } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { createBvhMap } from 'utils/LP/Retarget';
import { Scene } from '@babylonjs/core';
import { GLTFData } from '@babylonjs/serializers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { PlaskBvhMap, AnimationIngredient, ServerAnimationResponse, ServerAnimation, ServerAnimationLayer, PlaskAsset } from 'types/common';
import { convertModel, getAnimation } from 'api';
import plaskEngine from '3d/PlaskEngine';
import { AnimationModule } from '3d/modules/animation/AnimationModule';

async function getAllAnimationIngredients(animationIngredients: AnimationIngredient[], animationIds: string[], asset: PlaskAsset) {
  const promiseResults = await Promise.allSettled(
    animationIds.map(async (animationId) => {
      const animationIngredient = find(animationIngredients, { id: animationId });
      if (animationIngredient) {
        return animationIngredient;
      } else {
        const _animation: ServerAnimationResponse = await getAnimation(animationId);
        const animationLayers = _animation.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
        const animation = omitBy(_animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;

        return AnimationModule.serverDataToIngredient(animation, animationLayers, asset.transformNodes, false, asset.id);
      }
    }),
  );
  const fulFilledResults = promiseResults.filter((result) => result.status === 'fulfilled') as PromiseFulfilledResult<AnimationIngredient>[];
  return fulFilledResults.map((result) => result.value);
}
export default function* handleExportAsset(action: ReturnType<typeof lpNodeActions.exportAsset>) {
  const { lpNode, plaskProject, animationData, screenData }: RootState = yield select();
  const { visibilityOptions } = screenData;
  const { nodes } = lpNode;
  const { screenList, fps, assetList } = plaskProject;
  const { animationIngredients, retargetMaps } = animationData;
  const { parentId, type, assetId, nodeName, motion, format } = action.payload;

  const baseScreen = screenList[0];
  const baseScene = baseScreen.scene;

  plaskEngine.assetModule.clearAnimationGroups(screenList);

  if (baseScene.animationGroups.length === 0) {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Exporting file', message: 'This can take up to 3 minutes' }));

    if (motion !== 'none') {
      const asset = find(assetList, { id: assetId });
      const targetMotion = find(nodes, { id: motion });
      const animationIds = targetMotion ? [targetMotion.animationId!] : nodes.filter((node) => node.assetId === assetId && node.type === 'MOTION').map((node) => node.animationId!);
      const ingredients: AnimationIngredient[] = yield call(getAllAnimationIngredients, animationIngredients, animationIds, asset!);

      console.log(ingredients);
      ingredients.forEach((animationIngredient) => {
        const animationGroup = plaskEngine.animationModule.createAnimationGroupFromIngredient(animationIngredient, fps);
      });
    }

    plaskEngine.assetModule.unpowerSkeletonViewer(baseScreen.id);

    const parentAsset = find(nodes, { id: parentId });

    const resultName = type === 'Model' ? nodeName : parentAsset?.name || nodeName;

    const glb: GLTFData = yield call(sceneToGlb, baseScene, resultName);
    if (format === 'glb') {
      glb.downloadFiles();
      yield put(globalUIActions.closeModal());
    } else if (format === 'fbx' || format === 'fbx_unreal') {
      const fileName = Object.keys(glb.glTFFiles);
      const file = new File([glb.glTFFiles[fileName[0]]], resultName);
      file.path = resultName;

      try {
        const fbxUrl: string = yield call(convertModel, file, format);
        const link = document.createElement('a');
        link.href = fbxUrl;
        link.download = resultName;
        link.click();
        yield put(globalUIActions.closeModal());
      } catch (e) {
        yield put(
          globalUIActions.openModal('AlertModal', {
            title: 'Warning',
            message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
            confirmText: 'Close',
          }),
        );
      }
    } else if (format === 'bvh') {
      const asset = find(assetList, { id: assetId });

      if (asset) {
        const { retargetMapId, bones } = asset;
        const retargetMap = find(retargetMaps, { id: retargetMapId });

        if (retargetMap) {
          const bvhMap: PlaskBvhMap = yield call(createBvhMap, bones, retargetMap, 3000);

          const fileName = Object.keys(glb.glTFFiles);
          const file = new File([glb.glTFFiles[fileName[0]]], resultName);
          file.path = resultName;

          try {
            const bvhUrl: string = yield call(convertModel, file, 'bvh', bvhMap);
            const link = document.createElement('a');
            link.href = bvhUrl;
            link.download = resultName;
            link.click();
            yield put(globalUIActions.closeModal());
          } catch (e) {
            yield put(
              globalUIActions.openModal('AlertModal', {
                title: 'Warning',
                message: 'An error occured while exporting the model. If the problem recurs, please send us a message on our website.',
                confirmText: 'Close',
              }),
            );
          }
        }
      }
    }

    yield put(globalUIActions.closeModal('LoadingModal'));

    const targetVisibilityOption = visibilityOptions.find((visibilityOption) => visibilityOption.screenId === baseScreen.id);
    if (targetVisibilityOption && !targetVisibilityOption.isBoneVisible) {
      plaskEngine.assetModule.unpowerSkeletonViewer(baseScreen.id);
    } else {
      plaskEngine.assetModule.powerSkeletonViewer(baseScreen.id);
    }
  }

  async function sceneToGlb(scene: Scene, name: string) {
    return await plaskEngine.assetModule.sceneToGlb(scene, name);
  }
}
