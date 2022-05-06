import { convertServerResponseToNode } from 'utils/LP/converters';
import { RootState } from 'reducers';
import { select, put, call } from 'redux-saga/effects';
import produce from 'immer';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as BABYLON from '@babylonjs/core';
import * as api from 'api';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { createAutoRetargetMap, createEmptyRetargetMap, isRetargetError } from 'utils/LP/Retarget';
import { getFileExtension, filterAnimatableTransformNodes, getRandomStringKey } from 'utils/common';
import { getInitialPoses } from 'utils/RP';
import { WARNING_07, WARNING_01 } from 'constants/Text';
import { AnimationIngredient, PlaskRetargetMap, PlaskPose, PlaskAsset } from 'types/common';
import { AddModelResponse } from 'types/LP';
import plaskEngine, { AnimationModule } from '3d/PlaskEngine';

export default function* handleAddModel(action: ReturnType<typeof lpNodeActions.addModelAsync.request>) {
  // TODO: reduce # of actions by handle multi-files at one action
  const { lpNode, plaskProject }: RootState = yield select();
  const file = action.payload;

  const baseScene = plaskProject.screenList[0].scene;

  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));
    const response: AddModelResponse = yield call(api.addModel, lpNode.sceneId, file);
    const modelNode = convertServerResponseToNode(response);

    if (!modelNode.assetId || !modelNode.modelUrl) {
      return;
    }
    // TODO: handling this in sever
    const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], modelNode.modelUrl, '', baseScene);
    const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
    if (!skeletons?.length || !skeletons[0].bones?.length || !meshes?.length) {
      throw new Error('Load asset container failed');
    }

    preprocessAssetContainerData(modelNode?.assetId, assetContainer);

    const animationIngredients = getCustomAnimationIngredients(modelNode.assetId, transformNodes, animationGroups);

    const retargetMap: PlaskRetargetMap = yield call(createRetargetMap, modelNode.assetId, skeletons);
    const extension = getFileExtension(modelNode.name).toLowerCase();
    const fileName = modelNode.name.split('.').slice(0, -1).join('.');
    const nodeName = getNodeName(lpNode.nodes, fileName, extension);
    const initialPoses: PlaskPose[] = getInitialPoses(transformNodes, skeletons);

    // TODO: animationIngredients로 모션 생성
    const motionNodes = Promise.all([]);

    const nextNodes = produce(lpNode.nodes, (draft) => {
      draft.push(modelNode);
    });

    const newAsset: PlaskAsset = {
      id: modelNode.assetId,
      name: nodeName,
      extension,
      meshes,
      initialPoses,
      geometries,
      skeleton: skeletons[0] ?? null,
      bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
      transformNodes,
      // motionNodes에서 animationids 추가
      animationIngredientIds: [],
      retargetMapId: retargetMap.id,
    };

    yield put(plaskProjectActions.addAsset({ asset: newAsset }));
    yield put(
      animationDataActions.addAsset({
        transformNodes: filterAnimatableTransformNodes(transformNodes),
        animationIngredients,
        retargetMap,
      }),
    );
    yield put(lpNodeActions.addModelAsync.success(nextNodes));

    if (isRetargetError(retargetMap)) {
      yield put(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: WARNING_01.replace(/%s/, fileName),
          confirmText: 'Close',
          confirmColor: 'cancel',
        }),
      );
    }
  } catch (e) {
    console.log(e);
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: WARNING_07,
        confirmText: 'Close',
        confirmColor: 'negative',
      }),
    );
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}

function preprocessAssetContainerData(assetId: string, assetContainer: BABYLON.AssetContainer) {
  const { meshes, skeletons, transformNodes } = assetContainer;

  meshes.forEach((mesh) => {
    // make meshes not-pickable for clicking joints
    mesh.isPickable = false;
  });

  skeletons[0].bones.forEach((bone) => {
    // set bone's id with unique string using its name and the id of its' asset
    bone.id = `${assetId}//${bone.name}//bone`;
  });

  transformNodes.forEach((transformNode) => {
    // set transformNode's id with unique string using its name and the id of its' asset
    transformNode.id = `${assetId}//${transformNode.name}//transformNode`;
  });
}

function getCustomAnimationIngredients(assetId: string, transformNodes: BABYLON.TransformNode[], animationGroups: BABYLON.AnimationGroup[]) {
  const animationIngredients: AnimationIngredient[] = [];

  animationGroups.forEach((animationGroup, idx) => {
    // block auto play when loading assets
    // @TODO need to find better ways to block
    animationGroup.pause();

    /**
     * create our custom data(animationIngredient) with asset's animationGroups
     * and set the first one as current animationIngredient
     */
    const animationIngredient = plaskEngine.animationModule.createAnimationIngredient(
      assetId,
      animationGroup.name,
      animationGroup.targetedAnimations,
      filterAnimatableTransformNodes(transformNodes),
      false,
      idx === 0,
    );

    animationIngredients.push(animationIngredient);
  });

  return animationIngredients;
}

async function createRetargetMap(assetId: string, skeletons: BABYLON.Skeleton[]) {
  try {
    return await createAutoRetargetMap(assetId, skeletons[0]?.bones, 3000);
  } catch (e) {
    return createEmptyRetargetMap(assetId);
  }
}

function getNodeName(nodes: LP.Node[], fileName: string, extension: string) {
  const currentPathNodeNames = nodes
    .filter((node) => node.parentId === '' && node.name.includes(`${fileName}`) && node.extension === extension)
    .map((filteredNode) => filteredNode.name);
  const check = checkCreateDuplicates(`${fileName}`, currentPathNodeNames);

  return check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
}
