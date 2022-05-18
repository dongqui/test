import { find, cloneDeep, omitBy } from 'lodash';
import { select, put, SagaReturnType, call, take } from 'redux-saga/effects';
import { channel } from 'redux-saga';
import produce from 'immer';

import { RootState } from 'reducers';
import { beforeMove } from 'utils/LP/FileSystem';
import { forceClickAnimationPlayAndStop, filterAnimatableTransformNodes } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as cpActions from 'actions/CP/cpModeSelection';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import plaskEngine from '3d/PlaskEngine';
import { AnimationModule } from '3d/modules/animation/AnimationModule';
import { RequestNodeResponse } from 'types/LP';
import * as api from 'api';
import { convertServerResponseToNode } from 'utils/LP/converters';
import { ServerAnimationLayer, ServerAnimation } from 'types/common';

function handleDuplicateName(nodes: LP.Node[], mocapName: string, modelId: string): string {
  const currentPathNodeName = nodes
    .filter((node) => {
      if (node.parentId === modelId) {
        const tempName = mocapName.replace(/ \(\d+\)$/g, '');
        return tempName !== node.name && !node.name.includes(`${tempName} `);
      }
    })
    .map((filteredNode) => filteredNode.name);

  const nodeName = beforeMove({
    name: mocapName,
    comparisonNames: currentPathNodeName,
  });

  return nodeName;
}

const handleConfirmOnError = channel();

export function* watchConfirmOnError() {
  while (true) {
    const action: SagaReturnType<typeof lpNodeActions.visualizeModel | typeof cpActions.switchMode> = yield take(handleConfirmOnError);
    yield put(action);
  }
}

export function* handleDropMocapOnModel(action: ReturnType<typeof lpNodeActions.dropMocapOnModel>) {
  const { lpNode, plaskProject, animationData }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const { assetList } = plaskProject;
  const { retargetMaps } = animationData;
  const { nodeId, assetId } = action.payload;

  /**
   * @TODO 리타겟 및 하위로 모션 추가
   */
  const modelNode = find(nodes, { id: nodeId });

  // create new animationIngredient using ModelNode and MotionNode
  const targetAsset = assetList.find((asset) => asset.id === modelNode?.assetId);
  const targetRetargetMap = retargetMaps.find((retargetMap) => retargetMap.assetId === modelNode?.assetId);

  const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

  if (isErrorRetargetMap || !draggedNode?.mocapData) {
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

  if (draggedNode && modelNode && targetAsset && targetRetargetMap) {
    try {
      yield put(
        globalUIActions.openModal('LoadingModal', {
          title: 'Waiting',
          message: TEXT.WAITING_03,
        }),
      );

      const nodeName = handleDuplicateName(lpNode.nodes, draggedNode.name, nodeId);
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
      const clonedMocap = cloneDeep(draggedNode);
      const nextNodes = produce(nodes, (draft) => {
        const targetModel = find(draft, { id: nodeId });

        if (targetModel) {
          clonedMocap.assetId = mocapAnimationIngredient.assetId;
          clonedMocap.id = mocapAnimationIngredient.id;
          clonedMocap.parentId = nodeId;
          clonedMocap.name = nodeName;
          clonedMocap.type = 'MOTION';

          targetModel.childNodeIds.push(clonedMocap.id);

          const { mocapData, ...restObject } = clonedMocap;

          // @TODO 하위 노드도 추가
          draft.push({
            ...restObject,
          });
        }
      });

      yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
      yield put(animationDataActions.addAnimationIngredient({ animationIngredient: mocapAnimationIngredient }));
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: modelNode.assetId!, animationIngredientId: mocapAnimationIngredient.id }));

      if (modelNode?.assetId) {
        yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: modelNode.assetId, animationIngredientId: mocapAnimationIngredient.id }));
        yield put(lpNodeActions.visualizeModel(modelNode));
        forceClickAnimationPlayAndStop();
      }
    } catch (error) {
      yield put(
        globalUIActions.openModal('AlertModal', {
          title: 'Warning',
          message: TEXT.WARNING_07,
          confirmText: 'Close',
          confirmColor: 'negative',
        }),
      );
    } finally {
      yield put(globalUIActions.closeModal('LoadingModal'));
    }
  } else {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: function* () {
          if (modelNode) {
            handleConfirmOnError.put(lpNodeActions.visualizeModel(modelNode));
            handleConfirmOnError.put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
  }

  yield put(lpNodeActions.setDraggedNode(null));
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
  console.log(targetAsset);
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
