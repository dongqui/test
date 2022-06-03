import { convertServerResponseToNode } from 'utils/LP/converters';
import { RootState } from 'reducers';
import { select, put, call, all } from 'redux-saga/effects';
import produce from 'immer';
import { omitBy, findIndex } from 'lodash';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as BABYLON from '@babylonjs/core';
import * as api from 'api';
import { createRetargetMap } from 'utils/LP/Retarget';
import { getFileExtension, filterAnimatableTransformNodes } from 'utils/common';
import { getInitialPoses, getCustomAnimationIngredients } from 'utils/RP';
import { PlaskRetargetMap, PlaskPose, PlaskAsset, ServerAnimationLayer, ServerAnimation, AnimationIngredient } from 'types/common';
import { RequestNodeResponse } from 'types/LP';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import plaskEngine from '3d/PlaskEngine';

async function generateDataFromDefaultModels(defaultModelNode: LP.Node, baseScene: BABYLON.Scene, sceneId: string, nodes: LP.Node[]) {
  if (!defaultModelNode.modelUrl || !defaultModelNode.assetId) {
    return;
  }

  const assetContainer: BABYLON.AssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync(defaultModelNode.modelUrl, '', baseScene);
  const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
  plaskEngine.assetModule.preprocessAssetContainerData(defaultModelNode.assetId, assetContainer);

  const rawAnimationIngredients = getCustomAnimationIngredients(defaultModelNode.assetId, transformNodes, animationGroups);
  const rawRetargetMap: PlaskRetargetMap = await createRetargetMap(defaultModelNode.assetId, skeletons);
  const modelWithRetargetmapRes: RequestNodeResponse = await api.putRetargetMap(sceneId, defaultModelNode.id, {
    hipSpace: rawRetargetMap.hipSpace,
    values: rawRetargetMap.values,
  });

  const modelNode = convertServerResponseToNode(modelWithRetargetmapRes);

  const extension = getFileExtension(modelNode.name).toLowerCase();
  const initialPoses: PlaskPose[] = getInitialPoses(transformNodes, skeletons);

  const motionNodesRes: RequestNodeResponse[] = await Promise.all(
    rawAnimationIngredients.map((ingredient) => {
      const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(ingredient, 30, false);
      return api.postMotion(sceneId, modelNode.id, {
        animation: serverAnimation,
        animationLayer: serverAnimationLayers,
      });
    }),
  );

  const motionNodes = motionNodesRes.map(convertServerResponseToNode);
  const animationIngredients = motionNodes.map((motionNode) => {
    const animationLayers = motionNode?.animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
    const animation = omitBy(motionNode?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
    return AnimationModule.serverDataToIngredient(animation, animationLayers, transformNodes, false, modelNode.assetId!);
  });

  const newAsset: PlaskAsset = {
    id: modelNode.assetId!,
    name: modelNode.name,
    extension,
    meshes,
    initialPoses,
    geometries,
    skeleton: skeletons[0] ?? null,
    bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
    transformNodes,
    animationIngredientIds: motionNodes.map((motion) => motion?.animation?.uid!),
    retargetMapId: modelNode.id,
  };

  return {
    asset: newAsset,
    animationIngredients,
    modelNode: {
      ...modelNode,
      childNodeIds: motionNodes.map((node) => node.id),
    },
    motionNodes,
  };
}

export default function* handleInitDefaultSceneModelData(action: ReturnType<typeof lpNodeActions.initDefaultSceneModelData.request>) {
  const { lpNode, plaskProject }: RootState = yield select();
  const defaultModelNodes = action.payload;
  const baseScene = plaskProject.screenList[0].scene;
  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));

    const defaultData: { asset: PlaskAsset; animationIngredients: AnimationIngredient[]; modelNode: LP.Node; motionNodes: LP.Node[] }[] = yield all(
      defaultModelNodes.map((defaultModelNode) => call(generateDataFromDefaultModels, defaultModelNode, baseScene, lpNode.sceneId, lpNode.nodes)),
    );

    for (const { asset, animationIngredients, modelNode, motionNodes } of defaultData) {
      yield put(animationDataActions.addAnimationIngredients({ animationIngredients: animationIngredients }));
      yield put(plaskProjectActions.addAnimationIngredients({ assetId: asset.id, animationIngredientIds: animationIngredients.map((ingredient) => ingredient.id) }));
      yield put(plaskProjectActions.addAsset({ asset }));
      yield put(
        animationDataActions.addAsset({
          transformNodes: filterAnimatableTransformNodes(asset.transformNodes),
          animationIngredients,
          retargetMap: {
            ...modelNode.retargetMap!,
            id: modelNode.id,
            assetId: modelNode.assetId!,
          },
        }),
      );

      const updatedState: RootState = yield select();
      const nextNodes = produce(updatedState.lpNode.nodes, (draft) => {
        const modelNodeIdx = findIndex(draft, { id: modelNode.id });
        draft.splice(modelNodeIdx, 1, modelNode);
        draft.push(...motionNodes);
      });

      yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
    }
  } catch (e) {
    console.log(e);
    alert('failed');
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}
