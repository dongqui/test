import { find, omitBy } from 'lodash';
import { select, put, take, call, SagaReturnType, all, putResolve } from 'redux-saga/effects';
import { channel } from 'redux-saga';

import * as api from 'api';
import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import plaskEngine from '3d/PlaskEngine';
import { forceClickAnimationPlayAndStop } from 'utils/common';
import { goToSpecificPoses } from 'utils/RP';
import { ServerAnimationResponse, ServerAnimationLayer, ServerAnimation, PlaskProject, PlaskAsset } from 'types/common';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { addIKAction, removeIKAction } from 'actions/iKAction';
import { addIK } from 'sagas/RP/ik/addIK';

const clickJointChannel = channel();

export function* watchClickJointChannelFromMotionVizsualize() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export default function* handleVisualizeMotion(action: ReturnType<typeof lpNodeActions.visualizeMotion>) {
  const plaskProjectSelector = (state: RootState) => state.plaskProject;
  const { plaskProject, lpNode }: RootState = yield select();
  const { screenList, assetList, visualizedAssetIds } = plaskProject;
  const { assetId, nodeId, parentId } = action.payload;

  plaskEngine.assetModule.clearAnimationGroups(screenList);
  const modelNode = find(lpNode.nodes, { id: parentId });
  const motionNode = find(lpNode.nodes, { id: nodeId });
  if (!assetId || !modelNode || !motionNode?.animationId) {
    return;
  }
  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));

    let asset = find(assetList, { id: modelNode.assetId });

    if (!asset) {
      yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode, motionNode.id));
      yield take('ADDED_NEW_ASSET');
    }

    if (!asset) {
      const assetList: PlaskAsset[] = yield select((state: RootState) => state.plaskProject.assetList);
      asset = assetList.find((a) => a.id === modelNode.assetId);
      if (!asset) {
        throw Error('No asset');
      }
    }
    const targetAnimationIngredientId = asset?.animationIngredientIds?.find((id) => motionNode.animationId === id);
    if (!targetAnimationIngredientId) {
      const _animation: ServerAnimationResponse = yield call(api.getAnimation, motionNode.animationId!);
      const animationLayers = _animation.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
      const animation = omitBy(_animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
      let { animationIngredient } = plaskEngine.animationModule.serverDataToIngredient(animation, animationLayers, asset.transformNodes, false, asset.id);

      yield put(animationDataActions.addAnimationIngredient({ animationIngredient }));
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: asset.id, animationIngredientId: animationIngredient.id }));
    }

    const newRootState: RootState = yield select();
    const targetAnimationIngredient = find(newRootState.animationData.animationIngredients, { id: motionNode?.animationId });

    const currentAsset = assetList.find((asset) => asset.id === modelNode.assetId);
    if (currentAsset) {
      goToSpecificPoses(currentAsset.initialPoses);
    }

    yield put(
      animationDataActions.changeCurrentAnimationIngredient({
        assetId: modelNode.assetId!,
        animationIngredientId: targetAnimationIngredient?.id!,
      }),
    );

    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== modelNode.assetId;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      // Find transform node
      const ptns = plaskEngine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id.includes(prevAssetId));
      yield put(selectingDataActions.removeEntity({ targets: ptns }));

      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
      yield put(plaskProjectActions.unrenderAsset({ assetId: prevAssetId }));
      yield put(removeIKAction(prevAssetId));
      plaskEngine.assetModule.unvisualizeModel(prevAssetId);

      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    }

    const newPlaskProject: PlaskProject = yield select(plaskProjectSelector);

    if (modelNode?.assetId && !visualizedAssetIds.includes(modelNode.assetId)) {
      const asset = find(newPlaskProject.assetList, { id: modelNode.assetId });
      if (asset?.animationIngredientIds[0]) {
        plaskEngine.assetModule.visualizeModel(modelNode.assetId);
        let plaskTransformNodes = plaskEngine.assetModule.generateJointPlaskTransformNodes(modelNode.assetId);
        // Auto add ik code
        // plaskTransformNodes = plaskTransformNodes.concat(plaskEngine.ikModule.addIK(modelNode.assetId));
        plaskEngine.ikModule.setIKtoFK(plaskEngine.ikModule.ikControllers);
        yield put(selectingDataActions.addEntity({ targets: plaskTransformNodes }));
        // This appends PlaskTransformNodes to state.selectableObjects
        yield put(selectingDataActions.updateSelectableObjects({ objects: plaskTransformNodes }));

        // This only sets state.visualizedAssetIds
        yield put(plaskProjectActions.renderAsset({ assetId: modelNode.assetId }));
      }
    }

    // Foot locking
    let animationIngredient = plaskEngine.animationModule.getCurrentAnimationIngredient(assetId);

    if (animationIngredient) {
      const contactData = plaskEngine.animationModule.extractContactData(animationIngredient);
      if (contactData.length) {
        console.log('Auto add IK because foot locking is required.');
        yield call(addIK, addIKAction(asset.id, animationIngredient));
        animationIngredient = plaskEngine.animationModule.updateIngredientWithFootLocking(animationIngredient, contactData);
      }
      yield put(animationDataActions.editAnimationIngredient({ animationIngredient }));
    }

    forceClickAnimationPlayAndStop(50);
  } catch (e) {
    console.log(e);
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}
