import { select, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';
import produce from 'immer';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as animationDataActions from 'actions/animationDataAction';
import * as TEXT from 'constants/Text';

export function* handleEditNodeNameRequest(action: ReturnType<typeof lpNodeActions.editNodeNameSocket.request>) {
  const { newName, nodeId } = action.payload;
  const { lpNode }: RootState = yield select();
  const { nodes } = lpNode;
  const targetNode = nodes.find((node) => node.id === nodeId);
  if (!targetNode) {
    yield put(lpNodeActions.setEditingNodeId(null));
    return;
  }

  const isDuplicatedName = nodes.some((node) => node.parentId === targetNode.parentId && node.id !== targetNode.id && node.type === targetNode.type && node.name === newName);
  if (isDuplicatedName) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: TEXT.DUPLICATE_01,
        confirmText: 'Close',
        onConfirm: () => {
          // TODO: focus input?
        },
      }),
    );
  } else {
    yield put(
      lpNodeActions.editNodeNameSocket.send({
        type: 'update-name',
        scenesLibraryId: nodeId,
        data: {
          name: newName,
        },
      }),
    );
  }

  yield put(lpNodeActions.setEditingNodeId(null));
}

export function* handleEditNodeNameReceive(action: ReturnType<typeof lpNodeActions.editNodeNameSocket.receive>) {
  const { lpNode, animationData }: RootState = yield select();
  const { scenesLibraryId, data } = action.payload;

  const targetNode = _.find(lpNode.nodes, { id: scenesLibraryId });
  if (!targetNode) {
    return;
  }

  if (targetNode.type === 'MOTION') {
    const animationIngredient = animationData.animationIngredients.find((animationIngredient) => targetNode?.animationId === animationIngredient.id);
    if (animationIngredient) {
      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: Object.assign(animationIngredient, { name: data.name }),
        }),
      );
    }
  }
  const nextNodes = produce(lpNode.nodes, (draft) => {
    const _targetNode = _.find(draft, { id: targetNode.id });
    if (_targetNode) {
      _targetNode.name = data.name;
    }
  });
  yield put(lpNodeActions.editNodeNameSocket.update(nextNodes));
}

export default function* watchEditNodeNameSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.editNodeNameSocket.request), handleEditNodeNameRequest),
    takeLatest(getType(lpNodeActions.editNodeNameSocket.receive), handleEditNodeNameReceive),
  ]);
}
