import { call, select } from 'redux-saga/effects';

import * as api from 'api';
import { RootState } from 'reducers';
import { getNodesAsync } from 'actions/LP/lpNodeAction';

export default function* getNodes(action: ReturnType<typeof getNodesAsync.request>) {
  const { lpNode }: RootState = yield select();
  try {
    const nodes: LP.Node[] = yield call(api.getNodes, lpNode.sceneId);
    getNodesAsync.success({ nodes });
  } catch (e) {
    // getNodesAsync.failure(e);
  }
}
