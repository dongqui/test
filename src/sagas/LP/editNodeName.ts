import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';

export default function* handleEditNodeName(action: ReturnType<typeof lpNodeActions.editNodeName>) {
  const { newName, nodeId } = action.payload;
  const { lpNode, animationData }: RootState = yield select();
  const { nodes } = lpNode;

  const targetNode = nodes.find((node) => node.id === nodeId);
  if (!targetNode) {
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
    if (targetNode.type === 'Motion') {
      const animationIngredient = animationData.animationIngredients.find((animationIngredient) => targetNode.id === animationIngredient.id);
      if (!animationIngredient) {
        // TODO: error
        return;
      }
      yield put(
        animationDataActions.editAnimationIngredient({
          animationIngredient: Object.assign(animationIngredient, { name: newName }),
        }),
      );
    }

    const nodesWithModifiedNode = nodes.map((node) =>
      node === targetNode
        ? {
            ...node,
            name: newName,
          }
        : node,
    );

    yield put(lpNodeActions.changeNode({ nodes: nodesWithModifiedNode }));
  }

  yield put(lpNodeActions.setEditingNodeId(null));
}
