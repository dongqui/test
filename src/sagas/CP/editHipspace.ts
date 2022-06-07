import { put, call, select } from 'redux-saga/effects';
import { find, findIndex } from 'lodash';

import produce from 'immer';
import { RootState } from 'reducers';
import * as api from 'api';
import * as animationDataActions from 'actions/animationDataAction';
import * as cpActions from 'actions/CP';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { RequestNodeResponse } from 'types/LP';
import { convertServerResponseToNode } from 'utils/LP/converters';

export default function* handleEditHipsace(action: ReturnType<typeof cpActions.editHipspaceAsync.request>) {
  const { animationData, lpNode }: RootState = yield select();
  const { assetId, hipSpace } = action.payload;

  const modelNode = find(lpNode.nodes, { assetId, type: 'MODEL' });
  const retargetMap = find(animationData.retargetMaps, { assetId });

  if (!retargetMap || !modelNode) {
    return;
  }

  const newRetargetmap = {
    ...retargetMap,
    hipSpace,
  };

  const nodeResponse: RequestNodeResponse = yield call(api.putRetargetMap, lpNode.sceneId, modelNode.id, { hipSpace: newRetargetmap.hipSpace, values: newRetargetmap.values });
  const updatedModelNode = convertServerResponseToNode(nodeResponse);

  const nextNodes = produce(lpNode.nodes, (draft) => {
    const _modelNode = find(draft, { id: modelNode.id });
    if (_modelNode) {
      _modelNode.retargetMap = updatedModelNode.retargetMap;
    }
  });

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(animationDataActions.changeHipSpace(newRetargetmap));
}
