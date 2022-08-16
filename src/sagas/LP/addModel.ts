import { convertServerResponseToNode } from 'utils/LP/converters';
import { RootState } from 'reducers';
import { select, put, call, all } from 'redux-saga/effects';
import produce from 'immer';
import { omitBy } from 'lodash';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as BABYLON from '@babylonjs/core';
import * as api from 'api';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { createRetargetMap, isRetargetError } from 'utils/LP/Retarget';
import { getFileExtension, filterAnimatableTransformNodes } from 'utils/common';
import { getInitialPoses, getCustomAnimationIngredients } from 'utils/RP';
import { IMPORT_ERROR_UNKNOWN, WARNING_01, IMPORT_ERROR_NO_BONE, IMPORT_ERROR_NO_MESH, IMPORT_ERROR_INVALID_FORMAT } from 'constants/Text';
import { PlaskRetargetMap, PlaskPose, PlaskAsset, ServerAnimationLayer, ServerAnimation } from 'types/common';
import { AddModelResponse, RequestNodeResponse } from 'types/LP';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import plaskEngine from '3d/PlaskEngine';
import { NoBoneImportError, NoMeshImportError, InvalidFormatImportError } from 'errors';
import * as userActions from 'actions/User';

export default function* handleAddModel(action: ReturnType<typeof lpNodeActions.addModelAsync.request>) {
  // TODO: reduce # of actions by handle multi-files at one action
  const { lpNode, plaskProject }: RootState = yield select();
  const file = action.payload;
  const baseScene = plaskProject.screenList[0].scene;

  try {
    const extension = getFileExtension(file.name).toLowerCase();
    if (extension !== 'glb' && extension !== 'fbx') {
      throw new InvalidFormatImportError(IMPORT_ERROR_INVALID_FORMAT);
    }

    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, file.name));
    const { assetsUid, modelUrl, uid }: AddModelResponse = yield call(api.addModel, lpNode.sceneId, file);

    if (!assetsUid || !modelUrl) {
      return;
    }
    // TODO: handling this in sever
    const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], modelUrl, '', baseScene);
    const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
    if (!skeletons?.length || !skeletons[0].bones?.length) {
      throw new NoBoneImportError(IMPORT_ERROR_NO_BONE);
    }
    if (!meshes?.length) {
      throw new NoMeshImportError(IMPORT_ERROR_NO_MESH);
    }

    plaskEngine.assetModule.preprocessAssetContainerData(assetsUid, assetContainer);

    const rawAnimationIngredients = getCustomAnimationIngredients(assetsUid, transformNodes, animationGroups);
    const rawRetargetMap: PlaskRetargetMap = yield call(createRetargetMap, assetsUid, skeletons);
    const modelWithRetargetmapRes: RequestNodeResponse = yield call(api.putRetargetMap, lpNode.sceneId, uid, {
      hipSpace: rawRetargetMap.hipSpace,
      values: rawRetargetMap.values,
    });

    const modelNode = convertServerResponseToNode(modelWithRetargetmapRes);

    const fileName = modelNode.name.split('.').slice(0, -1).join('.');
    const nodeName = getNodeName(lpNode.nodes, fileName, extension);
    const initialPoses: PlaskPose[] = getInitialPoses(transformNodes, skeletons);

    const motionNodesRes: RequestNodeResponse[] = yield all(
      rawAnimationIngredients.map((ingredient) => {
        const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(ingredient, 30, false);
        return call(api.postMotion, lpNode.sceneId, modelNode.id, {
          animation: serverAnimation,
          animationLayer: serverAnimationLayers,
        });
      }),
    );

    const motionNodes = motionNodesRes.map(convertServerResponseToNode);
    modelNode.childNodeIds = motionNodes.map((node) => node.id);

    const newAsset: PlaskAsset = {
      id: modelNode.assetId!,
      name: nodeName,
      extension,
      meshes,
      initialPoses,
      geometries,
      skeleton: skeletons[0] ?? null,
      bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
      transformNodes,
      animationIngredientIds: [],
      retargetMapId: modelNode.id,
    };

    yield put(plaskProjectActions.addAsset({ asset: newAsset }));
    yield put(
      animationDataActions.addAsset({
        transformNodes: filterAnimatableTransformNodes(transformNodes),
        animationIngredients: [],
        retargetMap: {
          ...rawRetargetMap,
          id: modelNode.id,
          assetId: modelNode.assetId!,
        },
      }),
    );

    yield put(lpNodeActions.addModelAsync.success({ nodes: [modelNode, ...motionNodes] }));
    if (isRetargetError(rawRetargetMap)) {
      yield put(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: WARNING_01.replace(/%s/, fileName),
          confirmText: 'Close',
          confirmColor: 'cancel',
        }),
      );
    }
    yield put(userActions.getUserStorageInfoAsync.request());
  } catch (e) {
    const isClassifiedError = e instanceof NoBoneImportError || e instanceof NoMeshImportError || e instanceof InvalidFormatImportError;
    yield put(
      globalUIActions.openModal(
        '_AlertModal',
        {
          message: isClassifiedError ? e.message : IMPORT_ERROR_UNKNOWN,
          title: 'Import failed',
        },
        `import_error_${file.name}`,
      ),
    );
  } finally {
    yield put(globalUIActions.closeModal(file.name));
  }
}

function getNodeName(nodes: LP.Node[], fileName: string, extension: string) {
  const currentPathNodeNames = nodes
    .filter((node) => node.parentId === '' && node.name.includes(`${fileName}`) && node.extension === extension)
    .map((filteredNode) => filteredNode.name);
  const check = checkCreateDuplicates(`${fileName}`, currentPathNodeNames);

  return check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
}
