import { find, cloneDeep, filter } from 'lodash';
import { select, put, takeLatest, all, SagaReturnType, call, takeEvery } from 'redux-saga/effects';
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

export default function* handleDropMocapOnModel(action: ReturnType<typeof lpNodeActions.dropMocapOnModel>) {
  const { lpNode, plaskProject, animationData }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const { assetList } = plaskProject;
  const { retargetMaps } = animationData;
  const { nodeId, filePath, assetId, plaskEngine } = action.payload;

  const draggedNodeClone = cloneDeep(draggedNode);
  /**
   * @TODO 리타겟 및 하위로 모션 추가
   */
  const dropNode = find(nodes, { id: nodeId });
  const childrenList = nodes.filter((node) => node.parentId === nodeId);
  const isAlreadyExist = childrenList.some((children) => children.name === draggedNode?.name);

  // create new animationIngredient using ModelNode and MotionNode
  const targetAsset = assetList.find((asset) => asset.id === dropNode?.assetId);
  const targetRetargetMap = retargetMaps.find((retargetMap) => retargetMap.assetId === dropNode?.assetId);

  const isErrorRetargetMap = targetRetargetMap && targetRetargetMap.values.some((value) => !value.targetTransformNodeId);

  if (isErrorRetargetMap || !draggedNode?.mocapData) {
    yield put(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Confirm',
        message: TEXT.CONFIRM_04,
        onConfirm: function* () {
          if (assetId) {
            yield put(lpNodeActions.visualizeNode({ assetId, plaskEngine }));
            yield put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
      }),
    );
    return;
  }

  // if there is a node with the same name already
  if (dropNode && isAlreadyExist) {
    if (draggedNodeClone && dropNode && targetAsset && targetRetargetMap) {
      const currentPathNodeName = nodes
        .filter((node) => {
          if (node.parentId === nodeId) {
            const isMatch = draggedNodeClone.name.match(/ \(\d+\)$/g);
            const tempName = draggedNodeClone.name.replace(/ \(\d+\)$/g, '');

            // if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            if (tempName === node.name || node.name.includes(`${tempName} `)) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      const nodeName = beforeMove({
        name: draggedNodeClone.name,
        comparisonNames: currentPathNodeName,
      });

      try {
        const mocapAnimationIngredient: SagaReturnType<typeof plaskEngine.animationModule.createAnimationIngredientFromMocapData> = yield call(
          plaskEngine.animationModule.createAnimationIngredientFromMocapData,
          dropNode.assetId!,
          nodeName,
          targetRetargetMap,
          targetAsset.initialPoses,
          filterAnimatableTransformNodes(targetAsset.transformNodes),
          draggedNode?.mocapData,
          3000,
        );

        // 이름 중첩은 존재할 수 없기 때문에 첫 요소를 찾아내도 무방
        // const filterNodes = nodes.filter((node) => node.id !== duplicatedTarget[0].id);

        const nextNodes = produce(nodes, (draft) => {
          const targetNode = find(draft, { id: nodeId });

          if (targetNode) {
            draggedNodeClone.id = mocapAnimationIngredient.id;
            draggedNodeClone.assetId = mocapAnimationIngredient.assetId;
            draggedNodeClone.name = nodeName;
            draggedNodeClone.parentId = nodeId;
            draggedNodeClone.filePath = filePath + `\\${nodeName}`;
            draggedNodeClone.type = 'Motion';

            targetNode.childNodeIds.push(draggedNodeClone.id);

            const { mocapData, ...restObject } = draggedNodeClone;

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
          yield put(lpNodeActions.visualizeNode({ assetId: dropNode.assetId, plaskEngine }));
        }

        return;
      } catch (error) {}
    }
  }

  // @TODO 없으면 비활성 처리 필요
  if (draggedNodeClone && dropNode && targetAsset && targetRetargetMap) {
    try {
      yield put(
        globalUIActions.openModal('LoadingModal', {
          title: 'Waiting',
          message: TEXT.WAITING_03,
        }),
      );

      const mocapAnimationIngredient: SagaReturnType<typeof plaskEngine.animationModule.createAnimationIngredientFromMocapData> = yield call(
        plaskEngine.animationModule.createAnimationIngredientFromMocapData,
        dropNode.assetId!,
        draggedNode.name,
        targetRetargetMap,
        targetAsset.initialPoses,
        filterAnimatableTransformNodes(targetAsset.transformNodes),
        draggedNode.mocapData,
        3000,
      );

      const currentPathNodeName = nodes
        .filter((node) => {
          if (node.parentId === nodeId) {
            const isMatch = draggedNodeClone.name.match(/ \(\d+\)$/g);
            const tempName = draggedNodeClone.name.replace(/ \(\d+\)$/g, '');
            if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
              return true;
            }
            return false;
          }
        })
        .map((filteredNode) => filteredNode.name);

      const nodeName = beforeMove({
        name: draggedNodeClone.name,
        comparisonNames: currentPathNodeName,
      });

      const nextNodes = produce(nodes, (draft) => {
        const targetNode = find(draft, { id: nodeId });

        if (targetNode) {
          draggedNodeClone.assetId = mocapAnimationIngredient.assetId;
          draggedNodeClone.id = mocapAnimationIngredient.id;
          draggedNodeClone.parentId = nodeId;
          draggedNodeClone.filePath = filePath + `\\${nodeName}`;
          draggedNodeClone.name = nodeName;
          draggedNodeClone.type = 'Motion';

          targetNode.childNodeIds.push(draggedNodeClone.id);

          const { mocapData, ...restObject } = draggedNodeClone;

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
        yield put(lpNodeActions.visualizeNode({ assetId: dropNode.assetId, plaskEngine }));
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
            yield put(lpNodeActions.visualizeNode({ assetId: dropNode.assetId, plaskEngine }));
            yield put(cpActions.switchMode({ mode: 'Retargeting' }));
          }
        },
        onCancel: function* () {
          yield put(globalUIActions.closeModal());
        },
      }),
    );
  }

  yield put(lpNodeActions.setDraggedNode(null));
}
