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
import { getRecurrentRotationQuaternion } from 'utils/RP';
import { WARNING_07, WARNING_01 } from 'constants/Text';
import { AnimationIngredient, PlaskRetargetMap, PlaskPose, PlaskAsset } from 'types/common';
import { AddModelResponse } from 'types/LP';
import plaskEngine from '3d/PlaskEngine';

export default function* handleAddModel(action: ReturnType<typeof lpNodeActions.addModelAsync.request>) {
  // TODO: reduce # of actions by handle multi-files at one action
  const { lpNode, plaskProject }: RootState = yield select();
  const file = action.payload;

  const baseScene = plaskProject.screenList[0].scene;

  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));
    const { uid, modelUrl, assetsUid, name }: AddModelResponse = yield call(api.addModel, lpNode.sceneId, file);
    const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], modelUrl, '', baseScene);
    const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
    if (!skeletons?.length || !skeletons[0].bones?.length || !meshes?.length) {
      throw new Error('Load asset container failed');
    }

    preprocessAssetContainerData(assetsUid, assetContainer);

    const { animationIngredientIds, animationIngredients } = getCustomAnimationIngredients(assetsUid, transformNodes, animationGroups);
    const retargetMap: PlaskRetargetMap = yield call(_createRetargetMap, assetsUid, skeletons);
    const extension = getFileExtension(name).toLowerCase();
    const fileName = name.split('.').slice(0, -1).join('.');
    const nodeName = getNodeName(lpNode.nodes, fileName, extension);
    const initialPoses: PlaskPose[] = getInitialPoses(transformNodes, skeletons);

    const newAsset: PlaskAsset = {
      id: assetsUid,
      name: nodeName,
      extension,
      meshes,
      initialPoses,
      geometries,
      skeleton: skeletons[0] ?? null,
      bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
      transformNodes,
      animationIngredientIds,
      retargetMapId: retargetMap.id,
    };

    const nextNodes = produce(lpNode.nodes, (draft) => {
      const newModelNode: LP.Node = {
        id: uid,
        parentId: '',
        name: nodeName,
        extension,
        type: 'Model',
        assetId: newAsset.id,
        childNodeIds: animationIngredientIds,
      };
      draft.push(newModelNode);

      animationIngredients.forEach((ingredient) => {
        const motion: LP.Node = {
          id: ingredient.id,
          // parentId: ingredient.assetId,
          parentId: newModelNode.id,
          assetId: ingredient.assetId,
          name: ingredient.name,
          extension: '',
          type: 'Motion',
          childNodeIds: [],
        };
        draft.push(motion);
      });
    });

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
  const animationIngredientIds: string[] = [];
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

    animationIngredientIds.push(animationIngredient.id);
    animationIngredients.push(animationIngredient);
  });

  return { animationIngredientIds, animationIngredients };
}

async function _createRetargetMap(assetId: string, skeletons: BABYLON.Skeleton[]) {
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

function getInitialPoses(transformNodes: BABYLON.TransformNode[], skeletons: BABYLON.Skeleton[]) {
  return filterAnimatableTransformNodes(transformNodes).map((transformNode) => {
    const bone = skeletons[0].bones.find((bone) => bone.id === transformNode.id.replace('//transformNode', '//bone'))!;

    return {
      target: transformNode,
      position: transformNode.position.clone(),
      rotationQuaternion: transformNode.rotationQuaternion ? transformNode.rotationQuaternion.clone() : transformNode.rotation.clone().toQuaternion(),
      recurrentRotationQuaternion: bone ? getRecurrentRotationQuaternion(bone) : null,
      scaling: transformNode.scaling.clone(),
    };
  });
}
