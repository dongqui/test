import { find, cloneDeep } from 'lodash';
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

function handleDuplicateName(nodes: LP.Node[], mocapName: string, modelId: string): string {
  const currentPathNodeName = nodes
    .filter((node) => {
      if (node.parentId === modelId) {
        const isMatch = mocapName.match(/ \(\d+\)$/g);
        const tempName = mocapName.replace(/ \(\d+\)$/g, '');

        // if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
        if (tempName === node.name || node.name.includes(`${tempName} `)) {
          return true;
        }
        return false;
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
  const dropNode = find(nodes, { id: nodeId });

  // create new animationIngredient using ModelNode and MotionNode
  const targetAsset = assetList.find((asset) => asset.id === dropNode?.assetId);
  const targetRetargetMap = retargetMaps.find((retargetMap) => retargetMap.assetId === dropNode?.assetId);

  const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

  if (isErrorRetargetMap || !draggedNode?.mocapData) {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        onConfirm: function () {
          if (dropNode) {
            handleConfirmOnError.put(lpNodeActions.visualizeModel(dropNode));
            handleConfirmOnError.put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
    return;
  }

  if (draggedNode && dropNode && targetAsset && targetRetargetMap) {
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
        dropNode.assetId!,
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
      yield put(plaskProjectActions.addAnimationIngredient({ assetId: dropNode.assetId!, animationIngredientId: mocapAnimationIngredient.id }));

      if (dropNode.assetId) {
        yield put(animationDataActions.changeCurrentAnimationIngredient({ assetId: dropNode.assetId, animationIngredientId: mocapAnimationIngredient.id }));
        yield put(lpNodeActions.visualizeModel(dropNode));
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
          if (dropNode?.assetId) {
            handleConfirmOnError.put(lpNodeActions.visualizeModel(dropNode));
            handleConfirmOnError.put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
  }

  yield put(lpNodeActions.setDraggedNode(null));
}
