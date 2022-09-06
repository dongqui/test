import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take, call, all, putResolve } from 'redux-saga/effects';
import { find, omitBy } from 'lodash';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as TEXT from 'constants/Text';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskProject, ServerAnimationResponse, ServerAnimationLayer, ServerAnimation, PlaskAsset } from 'types/common/index';
import plaskEngine from '3d/PlaskEngine';
import * as api from 'api';
import { addIKAction, removeIKAction } from 'actions/iKAction';
import { addIK } from 'sagas/RP/ik/addIK';
import { removeIK } from 'sagas/RP/ik/removeIK';
import { AnimationModule } from '3d/modules/animation/AnimationModule';

const clickJointChannel = channel();

export function* watchClickJointChannelFromModelVisualize() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export function* handleVisualizeModel(action: ReturnType<typeof lpNodeActions.visualizeModel>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.`
  const plaskProjectSelector = (state: RootState) => state.plaskProject;
  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));

    let { modelNode, animationIngredientId } = action.payload;

    if (!modelNode.childNodeIds.length) {
      yield put(lpNodeActions.addEmptyMotionAsync.request({ assetId: modelNode.assetId!, nodeId: modelNode.id }));
      yield take('ADDED_EMPTY_MOTION');

      const { lpNode }: RootState = yield select();
      modelNode = find(lpNode.nodes, { id: modelNode.id }) || modelNode;
    }

    const { plaskProject, lpNode }: RootState = yield select();
    const { visualizedAssetIds, assetList } = plaskProject;
    const motionNode = find(lpNode.nodes, { id: modelNode.childNodeIds[0] });
    let asset = find(assetList, { id: modelNode.assetId });

    if (!asset) {
      yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode, motionNode?.id));
      yield take('ADDED_NEW_ASSET');
    }

    if (!asset) {
      const assetList: PlaskAsset[] = yield select((state: RootState) => state.plaskProject.assetList);
      asset = assetList.find((a) => a.id === modelNode.assetId);
      if (!asset) {
        throw Error('No asset');
      }
    }
    if (!modelNode || !motionNode?.animationId) {
      return;
    }

    const targetAnimationIngredientId = asset?.animationIngredientIds?.find((id) => motionNode?.animationId === id);
    if (!targetAnimationIngredientId) {
      const _animation: ServerAnimationResponse = yield call(api.getAnimation, motionNode?.animationId!);
      const animationLayers = _animation.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
      const animation = omitBy(_animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
      let { animationIngredient } = plaskEngine.animationModule.serverDataToIngredient(animation, animationLayers, asset.transformNodes, false, asset.id);

      yield put(animationDataActions.addAnimationIngredient({ animationIngredient: animationIngredient }));
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: asset.id, animationIngredientId: animationIngredient.id }));
    }

    const isAnotherAssetVisualized = visualizedAssetIds.length > 0;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      // Find transform node
      const ptns = plaskEngine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id.includes(prevAssetId));
      yield put(selectingDataActions.removeEntity({ targets: ptns }));

      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
      yield put(plaskProjectActions.unrenderAsset({ assetId: prevAssetId }));
      yield put(removeIKAction(prevAssetId));
      plaskEngine.assetModule.unvisualizeModel(prevAssetId);
    }
    // visualize new asset
    const newPlaskProject: PlaskProject = yield select(plaskProjectSelector);
    if (modelNode?.assetId) {
      const asset = find(newPlaskProject.assetList, { id: modelNode.assetId });
      if (asset?.animationIngredientIds[0]) {
        yield put(
          animationDataActions.changeCurrentAnimationIngredient({ assetId: modelNode.assetId, animationIngredientId: animationIngredientId || asset?.animationIngredientIds[0] }),
        );
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

        plaskEngine.assetModule.setVisibility(1);

        // Foot locking
        const state: RootState = yield select();
        const animationIngredientDirect = state.animationData.animationIngredients.find(
          (animationIngredient) => modelNode.assetId!.includes(animationIngredient.assetId) && animationIngredient.current,
        );
        let animationIngredient = plaskEngine.animationModule.getCurrentAnimationIngredient(modelNode.assetId) || animationIngredientDirect;

        if (animationIngredient) {
          const contactData = plaskEngine.animationModule.extractContactData(animationIngredient);
          if (contactData.length) {
            console.log('Contact data detected, using inverse kinematics to lock the feet...');
            yield call(addIK, addIKAction(asset.id, animationIngredient));
            // Update after adding IK tracks
            animationIngredient = plaskEngine.animationModule.getCurrentAnimationIngredient(asset.id)!;
            animationIngredient = plaskEngine.animationModule.updateIngredientWithFootLocking(animationIngredient, contactData);
            yield put(animationDataActions.editAnimationIngredient({ animationIngredient }));
            // Here, animationIngredient contains IK tracks, we don't want them, so we bake them
            for (const controller of plaskEngine.ikModule.ikControllers) {
              if (controller.limb.toLowerCase().includes('foot')) {
                plaskEngine.ikModule.setSelectedIk([controller]);

                const bakeResult = plaskEngine.ikModule.bakeIKintoFK(undefined, true);
                animationIngredient = bakeResult.animationIngredient || animationIngredient;
                yield put(animationDataActions.editAnimationIngredient({ animationIngredient }));

                // Set FK position to newly updated values
                plaskEngine.ikModule.setFKtoIK();
              }
            }
            // Release IK Controllers
            yield call(removeIK, removeIKAction(asset.id));

            // Remove Contact data
            animationIngredient = plaskEngine.animationModule.emptyContactDataFromAnimationIngredient(animationIngredient);
            const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(animationIngredient, 30, false);

            yield put(globalUIActions.openModal('LoadingModal', { title: 'Loading the file', message: 'This can take up to 3 minutes' }));

            plaskEngine.stopRenderLoop();
            yield call(api.replaceMotion, lpNode.sceneId, modelNode.id, animationIngredient.id, {
              animationLayer: serverAnimationLayers,
            });
            console.log('REPLACED MOTION');
            plaskEngine.startRenderLoop();
            yield put(globalUIActions.closeModal('LoadingModal'));
          } else if (plaskEngine.ikModule.isEnabled) {
            // IK was enabled before, so we need to add tracks for this new ingredient
            yield call(addIK, addIKAction(asset.id, animationIngredient));
            animationIngredient = plaskEngine.animationModule.getCurrentAnimationIngredient(modelNode.assetId)!;
          }
          yield put(animationDataActions.editAnimationIngredient({ animationIngredient }));
        } else {
          console.log('Could not find current animation ingredient for foot locking');
        }
      }
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
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}
