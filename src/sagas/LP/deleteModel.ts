import { select, put } from 'redux-saga/effects';
import { RootState } from 'reducers';
import { removeAssetThingsFromScene } from 'utils/RP';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import _ from 'lodash';

import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';

export default function* handleDeleteModel(action: ReturnType<typeof lpNodeActions.deleteModel>) {
  const { nodeId, assetId } = action.payload;
  const { lpNode, plaskProject, selectingData }: RootState = yield select();
  const targetModel = _.find(lpNode.nodes, { id: nodeId });

  if (!targetModel) {
    return;
  }
  removeAssetThingsFromScene(plaskProject, selectingData, assetId);

  const nextNodes = filterDeletedNode(lpNode.nodes, targetModel);

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(plaskProjectActions.removeAsset({ assetId }));
  yield put(animationDataActions.removeAsset({ assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId }));
  forceClickAnimationPlayAndStop();
}
