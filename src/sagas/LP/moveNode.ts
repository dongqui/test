import { find } from 'lodash';
import { select, put, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { getType } from 'typesafe-actions';

import { RootState } from 'reducers';
import { checkCreateDuplicates, beforeMove, changeNodeDepthById, getNodeMaxDepth, getFilePathDepth } from 'utils/LP/FileSystem';
import { getFileExtension } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

// export default function* handleMoveNode(action: ReturnType<typeof lpNodeActions.MoveNode>) {
//   const { lpNode }: RootState = yield select();
//   const { draggedNode, nodes } = lpNode;
//   const { filePath, nodeId } = action.payload;
//   const targetDirectory = find(nodes, { id: nodeId });
//   // TODO(?) check if there is a node with the same name already
//   // @TODO if not, need to deactivate
//   if (
//     !draggedNode ||
//     nodeId === draggedNode.id ||
//     (draggedNode?.type === 'Motion' && !draggedNode?.mocapData) ||
//     targetDirectory?.childNodeIds.find((childNodeId) => childNodeId === draggedNode.id)
//   ) {
//     return;
//   }

//   const maxDepth = getNodeMaxDepth(draggedNode.childNodeIds, 0, [], nodes) || 0;
//   const currentPathDepth = (filePath.match(/\\/g) || []).length;

//   if (currentPathDepth + maxDepth >= 6) {
//     yield put(
//       globalUIActions.openModal('AlertModal', {
//         title: 'Warning',
//         confirmText: 'Close',
//         message: 'A directory cannot exceed 6 layers.',
//       }),
//     );
//     return;
//   }

//   let nodeName = draggedNode.name;

//   if (draggedNode?.type === 'Folder' || draggedNode?.type === 'Mocap') {
//     const currentPathNodeName = nodes
//       .filter((node) => {
//         if (node.parentId === nodeId) {
//           const isMatch = draggedNode.name.match(/ \(\d+\)$/g);
//           const tempName = draggedNode.name.replace(/ \(\d+\)$/g, '');
//           if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
//             return true;
//           }
//           return false;
//         }
//       })
//       .map((filteredNode) => filteredNode.name);

//     nodeName = beforeMove({
//       name: draggedNode.name,
//       comparisonNames: currentPathNodeName,
//     });
//   }

//   if (draggedNode?.type === 'Model') {
//     const extension = getFileExtension(draggedNode.name).toLowerCase();
//     const fileName = draggedNode.name.split('.').slice(0, -1).join('.');

//     const currentPathNodeName = nodes.filter((node) => node.parentId === nodeId && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

//     const check = checkCreateDuplicates(`${fileName}`, currentPathNodeName);

//     nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
//   }

//   const nextNodes = produce(nodes, (draft) => {
//     const _draggedNode = find(draft, { id: draggedNode.id });
//     const targetDirectory = find(draft, { id: nodeId });
//     if (!_draggedNode || !targetDirectory) {
//       return;
//     }

//     _draggedNode.parentId = nodeId;
//     _draggedNode.filePath = filePath + `\\${targetDirectory.name}`;
//     _draggedNode.name = nodeName;

//     targetDirectory.childNodeIds.push(_draggedNode.id);

//     if (_draggedNode.childNodeIds.length > 0) {
//       _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
//     }

//     const prevFolder = find(draft, { id: draggedNode.parentId });
//     if (prevFolder) {
//       prevFolder.childNodeIds = prevFolder.childNodeIds.filter((childId) => childId !== _draggedNode.id);
//     }
//   });

//   yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
//   yield put(lpNodeActions.setDraggedNode(null));
// }

function* handleMoveNodeRequest(action: ReturnType<typeof lpNodeActions.moveNodeSocket.request>) {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const directoryId = action.payload;

  const isAlreadyContainedInThePath = draggedNode?.parentId === directoryId;
  if (!draggedNode || directoryId === draggedNode.id || (draggedNode?.type === 'MOTION' && !draggedNode?.mocapData) || isAlreadyContainedInThePath) {
    yield put(lpNodeActions.setDraggedNode(null));
    return;
  }

  const maxDepth = getNodeMaxDepth(draggedNode.childNodeIds, 0, [], nodes) || 0;
  const currentPathDepth = getFilePathDepth(nodes, draggedNode);

  if (currentPathDepth + maxDepth >= 6) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        confirmText: 'Close',
        message: 'A directory cannot exceed 6 layers.',
      }),
    );
  } else {
    yield put(
      lpNodeActions.moveNodeSocket.send({
        type: 'move',
        data: {
          scenesLibraryIds: [draggedNode.id],
          parentScenesLibraryId: directoryId,
        },
      }),
    );
  }

  yield put(lpNodeActions.setDraggedNode(null));
}

function* handleMoveNodeReceive(action: ReturnType<typeof lpNodeActions.moveNodeSocket.receive>) {
  const { lpNode }: RootState = yield select();
  const { parentScenesLibraryId, scenesLibraryIds } = action.payload.data;

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const targetDirectory = find(draft, { id: parentScenesLibraryId }) || '';

    for (const nodeId of scenesLibraryIds) {
      const _draggedNode = find(draft, { id: nodeId });
      const prevParentId = _draggedNode?.parentId;
      if (!_draggedNode) {
        return;
      }

      _draggedNode.parentId = parentScenesLibraryId;

      // TODO: 중복 네임 관련 규정
      // _draggedNode.name = nodeName;
      if (targetDirectory) {
        targetDirectory.childNodeIds.push(_draggedNode.id);
      }

      if (_draggedNode.childNodeIds.length > 0) {
        _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
      }

      const prevFolder = find(draft, { id: prevParentId });
      if (prevFolder) {
        prevFolder.childNodeIds = prevFolder.childNodeIds.filter((childId) => childId !== _draggedNode.id);
      }
    }
  });

  yield put(lpNodeActions.moveNodeSocket.update(nextNodes));
}

export default function* watchMoveNodeSocketActions() {
  yield all([takeLatest(getType(lpNodeActions.moveNodeSocket.request), handleMoveNodeRequest), takeLatest(getType(lpNodeActions.moveNodeSocket.receive), handleMoveNodeReceive)]);
}
