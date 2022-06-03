import { find, cloneDeep, omitBy } from 'lodash';
import { select, put, SagaReturnType, call, take } from 'redux-saga/effects';
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
import { ServerAnimationLayer, ServerAnimation } from 'types/common';

const handleConfirmOnError = channel();

export function* watchConfirmOnError() {
  while (true) {
    const action: SagaReturnType<typeof lpNodeActions.visualizeModel | typeof cpActions.switchMode> = yield take(handleConfirmOnError);
    yield put(action);
  }
}

export default function* handleApplyMocapToModel(action: ReturnType<typeof lpNodeActions.applyMocapToModel.request>) {
  const { lpNode, plaskProject }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const { assetList } = plaskProject;
  const { nodeId } = action.payload;

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

  if (!draggedNode || !modelNode || !targetRetargetMap || !draggedNode?.mocapData) {
    return;
  }

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

  // const nodeName = handleDuplicateName(lpNode.nodes, draggedNode.name, nodeId); TODO: 중복 처리
  const mocapAnimationIngredient: SagaReturnType<typeof plaskEngine.animationModule.createAnimationIngredientFromMocapData> = yield call(
    [plaskEngine.animationModule, plaskEngine.animationModule.createAnimationIngredientFromMocapData],
    modelNode.assetId!,
    draggedNode.name,
    targetRetargetMap,
    targetAsset.initialPoses,
    filterAnimatableTransformNodes(targetAsset.transformNodes),
    draggedNode.mocapData,
    3000,
  );

  const [serverAnimation, serverAnimationLayers] = AnimationModule.ingredientToServerData(mocapAnimationIngredient, 30, true);
  const motionNodesRes: RequestNodeResponse = yield call(api.postMotion, lpNode.sceneId, modelNode.id, {
    animation: serverAnimation,
    animationLayer: serverAnimationLayers,
  });
  const motionNode = convertServerResponseToNode(motionNodesRes);
  const animationLayers = motionNode?.animation?.scenesLibraryModelAnimationLayers as ServerAnimationLayer[];
  const animation = omitBy(motionNode?.animation, (value, key) => key === 'scenesLibraryModelAnimationLayers') as ServerAnimation;
  const animationIngredient = AnimationModule.serverDataToIngredient(animation, animationLayers, targetAsset.transformNodes, false, targetAsset.id);

  const nextNodes = produce(nodes, (draft) => {
    const targetModel = find(draft, { id: nodeId });
    targetModel?.childNodeIds.push(motionNode.id);
    draft.push(motionNode);
  });

  if (motionNode.assetId && motionNode?.animation?.uid) {
    yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
    yield put(animationDataActions.addAnimationIngredient({ animationIngredient: animationIngredient }));
    yield put(plaskProjectActions.addAnimationIngredient({ assetId: motionNode.assetId, animationIngredientId: animationIngredient.id }));
    yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: motionNode.assetId, animationIngredientId: animationIngredient.id }));
    yield put(lpNodeActions.visualizeModel(modelNode, animationIngredient.id));
    forceClickAnimationPlayAndStop();
  }
}
