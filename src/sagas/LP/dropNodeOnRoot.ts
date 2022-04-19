import { find } from 'lodash';
import { select, put } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import { checkCreateDuplicates, beforeMove, changeNodeDepthById } from 'utils/LP/FileSystem';
import { getFileExtension } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

export default function* handleDropNodeOnRoot() {
  const { lpNode }: RootState = yield select();
  const { draggedNode, nodes } = lpNode;

  if (!draggedNode) {
    return;
  }
  let nodeName = draggedNode.name;

  if (draggedNode?.type === 'DIRECTORY') {
    const currentPathNodeName = nodes
      .filter((node) => {
        if (node.parentId === '') {
          const isMatch = draggedNode.name.match(/ \(\d+\)$/g);
          const tempName = draggedNode.name.replace(/ \(\d+\)$/g, '');
          if (tempName === node.name || (isMatch !== null && node.name.includes(`${tempName} `))) {
            return true;
          }
          return false;
        }
      })
      .map((filteredNode) => filteredNode.name);

    nodeName = beforeMove({
      name: draggedNode.name,
      comparisonNames: currentPathNodeName,
    });
  }

  if (draggedNode?.type === 'MODEL') {
    const extension = getFileExtension(draggedNode.name).toLowerCase();
    const fileName = draggedNode.name.split('.').slice(0, -1).join('.');

    const currentPathNodeName = nodes.filter((node) => !node.parentId && node.name.includes(`${fileName}`)).map((filteredNode) => filteredNode.name);

    const check = checkCreateDuplicates(`${fileName}`, currentPathNodeName);

    nodeName = check === '0' ? `${fileName}.${extension}` : `${fileName} (${check}).${extension}`;
  }

  const nextNodes = produce(nodes, (draft) => {
    const _draggedNode = find(draft, { id: draggedNode.id });
    if (!_draggedNode) {
      return;
    }

    _draggedNode.parentId = '';

    if (_draggedNode.childNodeIds.length > 0) {
      _draggedNode.childNodeIds.map((child) => changeNodeDepthById(draft, child, _draggedNode));
    }

    const parentNode = find(draft, { id: draggedNode.parentId });
    if (parentNode) {
      parentNode.childNodeIds = parentNode.childNodeIds.filter((childId) => childId !== _draggedNode.id);
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(lpNodeActions.setDraggedNode(null));
}
