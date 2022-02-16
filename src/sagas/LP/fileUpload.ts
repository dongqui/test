import { RootState } from 'reducers';
import { select, put, call } from 'redux-saga/effects';
import { v4 as uuid } from 'uuid';
import produce from 'immer';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as BABYLON from '@babylonjs/core';
import { convertModel } from 'api';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { createAutoRetargetMap, createEmptyRetargetMap, isRetargetError } from 'utils/LP/Retarget';
import { getFileExtension, filterAnimatableTransformNodes, getRandomStringKey } from 'utils/common';
import { createAnimationIngredient, getRecurrentRotationQuaternion } from 'utils/RP';
import { WARNING_07, WARNING_01 } from 'constants/Text';
import { AnimationIngredient, PlaskRetargetMap, PlaskPose, PlaskAsset } from 'types/common';

async function getAssetContainer(file: File | string, extension: string, baseScene: BABYLON.Scene) {
  if (extension === 'fbx' && file instanceof File) {
    const fileUrl: string = await convertModel(file, 'glb');
    return await BABYLON.SceneLoader.LoadAssetContainerAsync(fileUrl, '', baseScene);
  } else if (extension === 'glb') {
    return file instanceof File
      ? await BABYLON.SceneLoader.LoadAssetContainerAsync('file:', file, baseScene)
      : await BABYLON.SceneLoader.LoadAssetContainerAsync(`/models/${file}`, '', baseScene);
  }

  throw new Error('Load asset container failed');
}

function preprocessAssetContainerData(assetId: string, assetContainer: BABYLON.AssetContainer) {
  const { meshes, skeletons, transformNodes } = assetContainer;

  meshes.forEach((mesh) => {
    // joint 클릭을 위해 mesh 클릭을 불가능하게 처리
    mesh.isPickable = false;
  });

  skeletons[0].bones.forEach((bone) => {
    // bone id를 unique한 id로 생성
    bone.id = `${assetId}//${bone.name}//bone`;
  });

  transformNodes.forEach((transformNode) => {
    // transformNode id를 unique한 id로 생성
    transformNode.id = `${assetId}//${transformNode.name}//transformNode`;
  });
}

function getCustomAnimationIngredients(assetId: string, transformNodes: BABYLON.TransformNode[], animationGroups: BABYLON.AnimationGroup[]) {
  const animationIngredientIds: string[] = [];
  const animationIngredients: AnimationIngredient[] = [];

  animationGroups.forEach((animationGroup, idx) => {
    // 모델 로드 시 animation 재생을 방지
    animationGroup.pause();

    /**
     * 모델이 가진 animationGroups를 통해 자체적인 애니메이션 데이터인 animationIngredients를 생성
     * 첫 번째 animationGroup을 current로 사용 (idx === 0)
     */
    const animationIngredient = createAnimationIngredient(
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
  const currentPathNodeNames = nodes.filter((node) => node.parentId === '__root__' && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);
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

function* handleFileUpload(action: ReturnType<typeof lpNodeActions.fileUpload>) {
  // TODO: file 복수 처리 -> action 줄이기
  const { lpNode, plaskProject }: RootState = yield select();
  const { file } = action.payload;

  const baseScene = plaskProject.screenList[0].scene;
  const rawFileName = file instanceof File ? file.name : file;
  const extension = getFileExtension(rawFileName).toLowerCase();
  const fileName = rawFileName.split('.').slice(0, -1).join('.');
  const assetId = getRandomStringKey();
  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, `loading_${fileName}`));
    const assetContainer: BABYLON.AssetContainer = yield call(getAssetContainer, file, extension, baseScene);
    yield put(globalUIActions.closeModal(`loading_${fileName}`));

    const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;

    if (!skeletons?.length || !skeletons[0].bones?.length || !meshes?.length) {
      throw new Error('Load asset container failed');
    }

    preprocessAssetContainerData(assetId, assetContainer);

    const { animationIngredientIds, animationIngredients } = getCustomAnimationIngredients(assetId, transformNodes, animationGroups);
    const retargetMap: PlaskRetargetMap = yield call(_createRetargetMap, assetId, skeletons);
    const nodeName = getNodeName(lpNode.nodes, fileName, extension);
    const initialPoses: PlaskPose[] = getInitialPoses(transformNodes, skeletons);

    const newAsset: PlaskAsset = {
      id: assetId,
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

    const newModelNode: LP.Node = {
      id: uuid(),
      parentId: '__root__',
      filePath: '\\root',
      name: nodeName,
      extension,
      type: 'Model',
      assetId: newAsset.id,
      childNodeIds: animationIngredientIds,
    };

    // 로드한 모델의 모션을 통해 LP 모션 노드 생성
    const newMotionNodes = animationIngredients.map((ingredient) => {
      const motion: LP.Node = {
        id: ingredient.id,
        // parentId: ingredient.assetId,
        parentId: newModelNode.id,
        assetId: ingredient.assetId,
        filePath: '\\root' + `\\${nodeName}`,
        name: ingredient.name,
        extension: '',
        type: 'Motion',
        childNodeIds: [],
      };

      return motion;
    });

    yield put(plaskProjectActions.addAsset({ asset: newAsset }));
    yield put(
      animationDataActions.addAsset({
        transformNodes: filterAnimatableTransformNodes(transformNodes),
        animationIngredients,
        retargetMap,
      }),
    );
    yield put(lpNodeActions.addNodes([newModelNode, ...newMotionNodes]));

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
  }
}

export default handleFileUpload;
