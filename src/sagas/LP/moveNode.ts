import { find } from 'lodash';
import { select, put, all, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import { getType } from 'typesafe-actions';

import { RootState } from 'reducers';
import { changeNodeDepthById, getNodeMaxDepth, getFilePathDepth } from 'utils/LP/FileSystem';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

function* handleMoveNodeRequest(action: ReturnType<typeof lpNodeActions.moveNodeSocket.request>) {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;
  const directoryId = action.payload;

  const isAlreadyContainedInThePath = draggedNode?.parentId === directoryId;
  if (!draggedNode || directoryId === draggedNode.id || (draggedNode?.type === 'MOTION' && !draggedNode?.mocapId) || isAlreadyContainedInThePath) {
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
