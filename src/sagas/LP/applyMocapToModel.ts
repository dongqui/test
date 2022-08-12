import { find, cloneDeep, omitBy } from 'lodash';
import { select, put, SagaReturnType, call, take, all, putResolve } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import produce from 'immer';

import { RootState } from 'reducers';
import { forceClickAnimationPlayAndStop, filterAnimatableTransformNodes } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as cpActions from 'actions/CP';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import plaskEngine from '3d/PlaskEngine';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import { RequestNodeResponse } from 'types/LP';
import * as api from 'api';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { ServerAnimationLayer, ServerAnimation, MocapDataResponse, ServerAnimationResponse } from 'types/common';
import * as userActions from 'actions/User';

const handleConfirmOnError = channel();

export function* watchConfirmOnError() {
  while (true) {
    const action: SagaReturnType<typeof lpNodeActions.visualizeModel | typeof cpActions.switchMode> = yield take(handleConfirmOnError);
    yield put(action);
  }
}

export default function* handleApplyMocapToModel(action: ReturnType<typeof lpNodeActions.applyMocapToModel.request>) {
  const { lpNode, plaskProject }: RootState = yield select();
  const { draggedNode, nodes, sceneId } = lpNode;
  const { assetList } = plaskProject;
  const { nodeId, mocapId } = action.payload;
  const modelNode = find(nodes, { id: nodeId });
  const targetRetargetMap = modelNode?.retargetMap;
  const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

  if (isErrorRetargetMap) {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        onConfirm: function () {
          if (modelNode) {
            handleConfirmOnError.put(lpNodeActions.visualizeModel(modelNode));
            handleConfirmOnError.put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
    return;
  }
  if (!draggedNode || !modelNode || !targetRetargetMap || !draggedNode?.mocapId) {
    yield put(
      globalUIActions.openModal('_AlertModal', {
        message: 'This model file is broken.',
        title: 'Import failed',
      }),
    );
    return;
  }

  yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));
  const _targetAsset = assetList.find((asset) => asset.id === modelNode?.assetId);
  if (!_targetAsset) {
    yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode));
    yield take('ADDED_NEW_ASSET');
  }
  const newRootState: RootState = yield select();
  const targetAsset = _targetAsset || newRootState.plaskProject.assetList.find((asset) => asset.id === modelNode?.assetId);

  if (!targetAsset) {
    return;
  }

  console.log('sceneId : ' + sceneId, mocapId);
  // const mocapData: MocapDataResponse = yield call(api.getMocapData, draggedNode.mocapId);
  const mocapData: MocapDataResponse = yield call(api.getMocapData, sceneId, mocapId);

  console.log(mocapData);

  const mocapAnimationIngredient: SagaReturnType<typeof plaskEngine.animationModule.createAnimationIngredientFromMocapData> = yield call(
    [plaskEngine.animationModule, plaskEngine.animationModule.createAnimationIngredientFromMocapData],
    modelNode.assetId!,
    draggedNode.name,
    targetRetargetMap,
    targetAsset.initialPoses,
    filterAnimatableTransformNodes(targetAsset.transformNodes),
    mocapData.data[0].trackData,
    3000,
  );

  const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(mocapAnimationIngredient, 30, true);
  const motionNodesRes: RequestNodeResponse = yield call(api.postMotion, lpNode.sceneId, modelNode.id, {
    animation: serverAnimation,
    animationLayer: serverAnimationLayers,
  });
  const motionNode = convertServerResponseToNode(motionNodesRes);

  const _animation: ServerAnimationResponse = yield call(api.getAnimation, motionNode?.animationId!);
  const animationLayers = _animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
  const animation = omitBy(_animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
  let { animationIngredient } = plaskEngine.animationModule.serverDataToIngredient(animation, animationLayers, targetAsset.transformNodes, false, targetAsset.id);

  const nextNodes = produce(nodes, (draft) => {
    const targetModel = find(draft, { id: nodeId });
    targetModel?.childNodeIds.push(motionNode.id);
    draft.push(motionNode);
  });

  if (motionNode.assetId && motionNode.animationId) {
    yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
    yield put(animationDataActions.addAnimationIngredient({ animationIngredient: animationIngredient }));
    yield put(plaskProjectActions.addAnimationIngredient({ assetId: motionNode.assetId, animationIngredientId: animationIngredient.id }));
    yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: motionNode.assetId, animationIngredientId: animationIngredient.id }));
    yield put(lpNodeActions.visualizeModel(modelNode, animationIngredient.id));
    forceClickAnimationPlayAndStop();
  }

  yield put(userActions.getUserUsagaInfoAsync.request());
  yield put(globalUIActions.closeModal('LoadingModal'));
}
