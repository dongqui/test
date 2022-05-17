import { channel } from 'redux-saga';
import { call, select, put, SagaReturnType, take } from 'redux-saga/effects';
import * as BABYLON from '@babylonjs/core';
import { find, omitBy } from 'lodash';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import plaskEngine from '3d/PlaskEngine';
import { PlaskRetargetMap, PlaskAsset, ServerAnimation } from 'types/common';
import { getFileExtension, filterAnimatableTransformNodes, forceClickAnimationPlayAndStop } from 'utils/common';
import { getInitialPoses, getCustomAnimationIngredients } from 'utils/RP';
import { createRetargetMap } from 'utils/LP/Retarget';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { AnimationModule } from '3d/modules/animation/AnimationModule';

const clickJointChannel = channel();

export function* watchClickJointChannel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export function* handleVisualizeModel(action: ReturnType<typeof lpNodeActions.visualizeModel>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.`
  const { plaskProject, lpNode }: RootState = yield select();
  const { visualizedAssetIds, screenList, assetList } = plaskProject;
  const baseScene = screenList[0].scene;
  const node = action.payload;

  if (!node.assetId) {
    return;
  }

  try {
    const asset = find(assetList, { id: node.assetId });
    if (!asset) {
      const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], node.modelUrl || '', '', baseScene);
      const { meshes, geometries, skeletons, transformNodes, animationGroups } = assetContainer;
      animationGroups.forEach((animationGroup, idx) => {
        // block auto play when loading assets
        // @TODO need to find better ways to block
        animationGroup.pause();
      });

      plaskEngine.assetModule.preprocessAssetContainerData(node.assetId, assetContainer);

      const motionNodes = node.childNodeIds.map((id) => find(lpNode.nodes, { id }));
      const newAsset: PlaskAsset = {
        id: node.assetId,
        name: node.name,
        extension: getFileExtension(node.name).toLowerCase(),
        meshes,
        initialPoses: getInitialPoses(transformNodes, skeletons),
        geometries,
        skeleton: skeletons[0] ?? null,
        bones: skeletons[0] ? skeletons[0].bones.filter((bone) => !bone.name.toLowerCase().includes('scene')) : [],
        transformNodes,
        animationIngredientIds: motionNodes.map((motion) => motion?.animation?.uid!),
        retargetMapId: node.id,
      };

      const animationIngredients = node.childNodeIds.map((id) => {
        const motion = find(lpNode.nodes, { id });
        const animationLayers = motion?.animation?.scenesLibraryModelAnimationLayers;
        const animation = omitBy(motion?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers');
        return AnimationModule.serverDataToIngredient(animation, animationLayers, newAsset.transformNodes, true, motion?.assetId);
      });

      yield put(plaskProjectActions.addAsset({ asset: newAsset }));
      yield put(
        animationDataActions.addAsset({
          transformNodes: filterAnimatableTransformNodes(transformNodes),
          animationIngredients,
          retargetMap: {
            id: node.id,
            assetId: node.assetId,
            ...node.retargetMap!,
          },
        }),
      );
    }

    // const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== node.assetId;
    // if (isAnotherAssetVisualized) {
    //   const prevAssetId = visualizedAssetIds[0];
    //   plaskEngine.assetModule.clearAssetFromScene(prevAssetId);
    //   yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    // }
    // visualize new asset
    if (node?.assetId && !visualizedAssetIds.includes(node.assetId)) {
      plaskEngine.assetModule.visualizeModel(node.assetId, clickJointChannel);
    }
  } catch (e) {
    console.log(e);
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: TEXT.WARNING_08,
        confirmText: 'Close',
        confirmColor: 'negative',
      }),
    );
  }
}
