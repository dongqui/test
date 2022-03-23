import { find } from 'lodash';
import { select, put, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { getType } from 'typesafe-actions';

import { RootState } from 'reducers';
import { checkCreateDuplicates, beforeMove, changeNodeDepthById, getNodeMaxDepth, getCurrentPathDepth } from 'utils/LP/FileSystem';
import { getFileExtension } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

// export default function* handleDropNodeOnFolder(action: ReturnType<typeof lpNodeActions.dropNodeOnFolder>) {
//   const { lpNode }: RootState = yield select();
//   const { draggedNode, nodes } = lpNode;
//   const { filePath, nodeId } = action.payload;
//   const targetFolder = find(nodes, { id: nodeId });
//   // TODO(?) check if there is a node with the same name already
//   // @TODO if not, need to deactivate
//   if (
//     !draggedNode ||
//     nodeId === draggedNode.id ||
//     (draggedNode?.type === 'Motion' && !draggedNode?.mocapData) ||
//     targetFolder?.childNodeIds.find((childNodeId) => childNodeId === draggedNode.id)
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
//     const targetFolder = find(draft, { id: nodeId });
//     if (!_draggedNode || !targetFolder) {
//       return;
//     }

//     _draggedNode.parentId = nodeId;
//     _draggedNode.filePath = filePath + `\\${targetFolder.name}`;
//     _draggedNode.name = nodeName;

//     targetFolder.childNodeIds.push(_draggedNode.id);

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

function* handleDropNodeOnFolderRequest(action: ReturnType<typeof lpNodeActions.dropNodeOnFolderSocket.request>) {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const folderId = action.payload;
  const targetFolder = find(nodes, { id: folderId });
  // TODO(?) check if there is a node with the same name already
  // @TODO if not, need to deactivate
  if (
    !draggedNode ||
    folderId === draggedNode.id ||
    (draggedNode?.type === 'Motion' && !draggedNode?.mocapData) ||
    targetFolder?.childNodeIds.find((childNodeId) => childNodeId === draggedNode.id)
  ) {
    yield put(lpNodeActions.setDraggedNode(null));
    return;
  }

  const maxDepth = getNodeMaxDepth(draggedNode.childNodeIds, 0, [], nodes) || 0;
  const currentPathDepth = getCurrentPathDepth(draggedNode);

  if (currentPathDepth + maxDepth >= 6) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        confirmText: 'Close',
        message: 'A directory cannot exceed 6 layers.',
      }),
    );
  } else {
    yield put(lpNodeActions.dropNodeOnFolderSocket.send({ nodeId: draggedNode.id, parentId: targetFolder?.id || '' }));
  }

  yield put(lpNodeActions.setDraggedNode(null));
}

function* handleDropNodeOnFolderSend(action: ReturnType<typeof lpNodeActions.dropNodeOnFolderSocket.send>) {
  // TODO: 중복네임 처리??
  // Socket.emit('library', {
  //   type: 'move',
  //   data: {
  //     scenesLibraryIds: [action.payload],
  //     parentScenesLibraryId: 'q8o5knz97pw01jgo5el24yrxv6m83qwx',
  //   },
  // });
}

function* handleDropNodeOnFolderReceive(action: ReturnType<typeof lpNodeActions.dropNodeOnFolderSocket.receive>) {
  const { lpNode }: RootState = yield select();
  const { parentScenesLibraryId, scenesLibraryIds } = action.payload.data;

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const targetFolder = find(draft, { id: parentScenesLibraryId });

    for (const nodeId of scenesLibraryIds) {
      const _draggedNode = find(draft, { id: nodeId });
      const prevParentId = _draggedNode?.parentId;
      if (!_draggedNode || !targetFolder) {
        return;
      }

      _draggedNode.parentId = parentScenesLibraryId;

      // TODO: 중복 네임 관련 규정
      // _draggedNode.name = nodeName;

      targetFolder.childNodeIds.push(_draggedNode.id);

      if (_draggedNode.childNodeIds.length > 0) {
        _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
      }

      const prevFolder = find(draft, { id: prevParentId });
      if (prevFolder) {
        prevFolder.childNodeIds = prevFolder.childNodeIds.filter((childId) => childId !== _draggedNode.id);
      }
    }
  });

  yield put(lpNodeActions.dropNodeOnFolderSocket.update(nextNodes));
}

export default function* waitDropNodeOnFolderSocketActions() {
  yield all([
    takeLatest(getType(lpNodeActions.dropNodeOnFolderSocket.request), handleDropNodeOnFolderRequest),
    takeLatest(getType(lpNodeActions.dropNodeOnFolderSocket.send), handleDropNodeOnFolderSend),
    takeLatest(getType(lpNodeActions.dropNodeOnFolderSocket.receive), handleDropNodeOnFolderReceive),
  ]);
}
