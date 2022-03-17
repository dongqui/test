import { call } from 'redux-saga/effects';

import * as api from 'api';
import { getNodesAsync } from 'actions/LP/lpNodeAction';

export default function* getNodes(action: ReturnType<typeof getNodesAsync.request>) {
  const sceneId = action.payload;

  try {
    const nodes: LP.Node[] = yield call(api.getNodes, sceneId);
    getNodesAsync.success({ nodes });
  } catch (e) {
    // getNodesAsync.failure(e);
  }
}
