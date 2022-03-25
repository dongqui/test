import { select, put, all, takeLatest } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';
import _ from 'lodash';
import produce from 'immer';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as animationDataActions from 'actions/animationDataAction';
import * as TEXT from 'constants/Text';

// export default function* handleEditNodeName(action: ReturnType<typeof lpNodeActions.editNodeName>) {
//   const { newName, nodeId } = action.payload;
//   const { lpNode, animationData }: RootState = yield select();
//   const { nodes } = lpNode;

//   const targetNode = nodes.find((node) => node.id === nodeId);
//   if (!targetNode) {
//     return;
//   }

//   const isDuplicatedName = nodes.some((node) => node.parentId === targetNode.parentId && node.id !== targetNode.id && node.type === targetNode.type && node.name === newName);

//   if (isDuplicatedName) {
//     yield put(
//       globalUIActions.openModal('AlertModal', {
//         title: 'Warning',
//         message: TEXT.DUPLICATE_01,
//         confirmText: 'Close',
//         onConfirm: () => {
//           // TODO: focus input?
//         },
//       }),
//     );
//   } else {
//     if (targetNode.type === 'Motion') {
//       const animationIngredient = animationData.animationIngredients.find((animationIngredient) => targetNode.id === animationIngredient.id);
//       if (!animationIngredient) {
//         // TODO: error
//         return;
//       }
//       yield put(
//         animationDataActions.editAnimationIngredient({
//           animationIngredient: Object.assign(animationIngredient, { name: newName }),
//         }),
//       );
//     }

//     const nodesWithModifiedNode = nodes.map((node) =>
//       node === targetNode
//         ? {
//             ...node,
//             name: newName,
//           }
//         : node,
//     );

//     yield put(lpNodeActions.changeNode({ nodes: nodesWithModifiedNode }));
//   }

//   yield put(lpNodeActions.setEditingNodeId(null));
// }

function* handleEditNodeNameRequest(action: ReturnType<typeof lpNodeActions.editNodeNameSocket.request>) {
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
    lpNodeActions.editNodeNameSocket.send({ nodeId, newName });
  }

  yield put(lpNodeActions.setEditingNodeId(null));
}

function* handleEditNodeNameSend(action: ReturnType<typeof lpNodeActions.editNodeNameSocket.send>) {
  // Socket.emit('library', {
  //   type: 'update',
  //   scenesLibraryId: action.payload.nodeId,
  //   data: {
  //     name: action.payload.newName,
  //   },
  // });
}

function* handleEditNodeNameReceive(action: ReturnType<typeof lpNodeActions.editNodeNameSocket.receive>) {
  const { lpNode, animationData }: RootState = yield select();
  const { scenesLibraryId, data } = action.payload;
  const targetNode = _.find(lpNode.nodes, { id: scenesLibraryId });
  if (!targetNode) {
    return;
  }

  if (targetNode.type === 'Motion') {
    const animationIngredient = animationData.animationIngredients.find((animationIngredient) => targetNode.id === animationIngredient.id);
    if (!animationIngredient) {
      // TODO: error
      return;
    }
    yield put(
      animationDataActions.editAnimationIngredient({
        animationIngredient: Object.assign(animationIngredient, { name: data.name }),
      }),
    );
  }
  const nextNodes = produce(lpNode.nodes, (draft) => {
    const _targetNode = _.find(draft, { id: targetNode.id });
    if (_targetNode) {
      _targetNode.name = data.name;
    }
  });
  yield put(lpNodeActions.editNodeNameSocket.update(nextNodes));
}

export default function* watcheditNodeNameSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.editNodeNameSocket.request), handleEditNodeNameRequest),
    takeLatest(getType(lpNodeActions.editNodeNameSocket.send), handleEditNodeNameSend),
    takeLatest(getType(lpNodeActions.editNodeNameSocket.receive), handleEditNodeNameReceive),
  ]);
}
