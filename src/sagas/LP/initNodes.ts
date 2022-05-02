import { put } from 'redux-saga/effects';
import { find } from 'lodash';

import * as lpActions from 'actions/LP/lpNodeAction';
import { convertServerResponseToNode } from 'utils/LP/converters';

function setChildNodeIds(nodes: LP.Node[]) {
  for (const node of nodes) {
    if (node.parentId) {
      const parentNode = find(nodes, { id: node.parentId });
      parentNode?.childNodeIds.push(node.id);
    }
  }
}

export default function* initNodes(action: ReturnType<typeof lpActions.initNodes>) {
  try {
    const nodes = action.payload.map(convertServerResponseToNode);
    setChildNodeIds(nodes);
    yield put(lpActions.changeNode({ nodes }));
  } catch (e) {
    // setNodesAsync.failure(e);
  }
}
