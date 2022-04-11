import { RootState } from 'reducers';
import { select, put, call } from 'redux-saga/effects';
import { v4 as uuid } from 'uuid';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import { convertModel } from 'api';
import { checkCreateDuplicates } from 'utils/LP/FileSystem';
import { createAutoRetargetMap, createEmptyRetargetMap, isRetargetError } from 'utils/LP/Retarget';
import { getFileExtension, filterAnimatableTransformNodes, getRandomStringKey } from 'utils/common';
import { createAnimationIngredient, getRecurrentRotationQuaternion } from 'utils/RP';
import { IMPORT_ERROR_UNKNODW, WARNING_01, IMPORT_ERROR_NO_BONE, IMPORT_ERROR_NO_MESH, IMPORT_ERROR_INVALID_FORMAT } from 'constants/Text';
import { AnimationIngredient, PlaskRetargetMap, PlaskPose, PlaskAsset } from 'types/common';
import { NoBoneImportError, NoMeshImportError, InvalidFormatImportError } from 'errors';
import { PlaskEngine } from '3d/PlaskEngine';
import { AnimationGroup, AssetContainer, Scene, Skeleton, TransformNode } from '@babylonjs/core';

export default function* handleFileUpload(action: ReturnType<typeof lpNodeActions.fileUpload>) {
  // TODO: reduce # of actions by handle multi-files at one action
  const { lpNode, plaskProject }: RootState = yield select();
  const { file, showLoading, plaskEngine } = action.payload;

  const baseScene = plaskProject.screenList[0].scene;
  const rawFileName = file instanceof File ? file.name : file;
  const extension = getFileExtension(rawFileName).toLowerCase();
  const fileName = rawFileName.split('.').slice(0, -1).join('.');
  const assetId = getRandomStringKey();
  try {
    if (extension !== 'glb' && extension !== 'fbx') {
      throw new InvalidFormatImportError(IMPORT_ERROR_INVALID_FORMAT);
    }

    if (showLoading) {
      yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, `loading_${fileName}`));
    }
    const assetContainer: AssetContainer = yield call(getAssetContainer, file, extension, baseScene, plaskEngine);
    if (assetContainer) {
      const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;

      if (!skeletons?.length || !skeletons[0].bones?.length) {
        throw new NoBoneImportError(IMPORT_ERROR_NO_BONE);
      }
      if (!meshes?.length) {
        throw new NoMeshImportError(IMPORT_ERROR_NO_MESH);
      }

      preprocessAssetContainerData(assetId, assetContainer, plaskEngine);

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

      // create MotionNode in LP with animationIngredients included in loaded asset
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
    }
  } catch (e) {
    const isClassifiedError = e instanceof NoBoneImportError || e instanceof NoMeshImportError || e instanceof InvalidFormatImportError;
    yield put(
      globalUIActions.openModal(
        'ImportErrorModal',
        {
          message: isClassifiedError ? e.message : IMPORT_ERROR_UNKNODW,
          fileName: rawFileName,
        },
        `import_error_${rawFileName}`,
      ),
    );
  } finally {
    if (showLoading) {
      yield put(globalUIActions.closeModal(`loading_${fileName}`));
    }
  }
}

async function getAssetContainer(file: File | string, extension: string, baseScene: Scene, plaskEngine: PlaskEngine) {
  return await plaskEngine.assetModule.getAssetContainer(file, extension, baseScene);
}

function preprocessAssetContainerData(assetId: string, assetContainer: AssetContainer, plaskEngine: PlaskEngine) {
  plaskEngine.assetModule.preprocessAssetContainerData(assetId, assetContainer);
}

function getCustomAnimationIngredients(assetId: string, transformNodes: TransformNode[], animationGroups: AnimationGroup[]) {
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

async function _createRetargetMap(assetId: string, skeletons: Skeleton[]) {
  try {
    return await createAutoRetargetMap(assetId, skeletons[0]?.bones, 3000);
  } catch (e) {
    return createEmptyRetargetMap(assetId);
  }
}

function getNodeName(nodes: LP.Node[], fileName: string, extension: string) {
  const currentPathNodeNames = nodes
    .filter((node) => node.parentId === '__root__' && node.name.includes(`${fileName}`) && node.extension === extension)
    .map((filteredNode) => filteredNode.name);
  const check = checkCreateDuplicates(`${fileName}`, currentPathNodeNames);

  return check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
}

function getInitialPoses(transformNodes: TransformNode[], skeletons: Skeleton[]) {
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
