import { select, put } from 'redux-saga/effects';
import { RootState } from 'reducers';
import { filterDeletedNode } from 'utils/LP/FileSystem';
import { find } from 'lodash';

import { forceClickAnimationPlayAndStop } from 'utils/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import plaskEngine from '3d/PlaskEngine';

export default function* handleDeleteModel(action: ReturnType<typeof lpNodeActions.deleteModel>) {
  const { nodeId, assetId } = action.payload;
  const { lpNode }: RootState = yield select();

  const targetNode = find(lpNode.nodes, { id: nodeId });

  if (!targetNode) {
    return;
  }

  const nextNodes = filterDeletedNode(lpNode.nodes, targetNode);

  plaskEngine.assetModule.clearAssetFromScene(assetId);

  yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  yield put(plaskProjectActions.removeAsset({ assetId }));
  yield put(animationDataActions.removeAsset({ assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId }));
  forceClickAnimationPlayAndStop();
}
