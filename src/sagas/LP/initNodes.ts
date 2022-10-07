import { getType } from 'typesafe-actions';
import { put, take } from 'redux-saga/effects';
import { find } from 'lodash';

import * as lpActions from 'actions/LP/lpNodeAction';
import { convertServerResponseToNode, setChildNodeIds } from 'utils/LP/converters';

function isFirstSceneLoad(nodes: LP.Node[]) {
  const noRetargetmap = nodes.every((node) => !node.retargetMap);
  const isModelType = nodes.every((node) => node.type === 'MODEL');

  return nodes.length === 4 && noRetargetmap && isModelType;
}

export default function* initNodes(action: ReturnType<typeof lpActions.initNodes>) {
  try {
    const nodes = action.payload.map(convertServerResponseToNode);
    setChildNodeIds(nodes);
    yield put(lpActions.changeNode({ nodes }));

    if (isFirstSceneLoad(nodes)) {
      yield take('plaskProject/ADD_SCREEN');
      yield put(lpActions.initDefaultSceneModelData.request(nodes));
    }
  } catch (e) {
    // setNodesAsync.failure(e);
  }
}
