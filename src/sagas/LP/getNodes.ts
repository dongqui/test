import { call, select, put } from 'redux-saga/effects';

import * as api from 'api';
import { RootState } from 'reducers';
import { getNodesAsync } from 'actions/LP/lpNodeAction';
import { RequestNodeResponse } from 'types/LP';
import { convertServerResponseToNode } from 'utils/LP/converters';

export default function* getNodes(action: ReturnType<typeof getNodesAsync.request>) {
  const { lpNode }: RootState = yield select();
  try {
    const res: RequestNodeResponse[] = yield call(api.getNodes, lpNode.sceneId);
    const nodes = res.map(convertServerResponseToNode);

    yield put(getNodesAsync.success(nodes));
  } catch (e) {
    // getNodesAsync.failure(e);
  }
}
