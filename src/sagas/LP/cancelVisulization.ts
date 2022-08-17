import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import { addIKAction, removeIKAction } from 'actions/iKAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';

export default function* handleCancelVisulization(action: ReturnType<typeof lpNodeActions.cancelVisulization>) {
  const { plaskProject }: RootState = yield select();
  const { visualizedAssetIds } = plaskProject;
  const { assetId } = action.payload;

  if (!assetId || !visualizedAssetIds.includes(assetId)) {
    return;
  }

  for (const assetId of visualizedAssetIds) {
    plaskEngine.assetModule.unvisualizeModel(assetId);

    const ptns = plaskEngine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id.includes(assetId));
    yield put(selectingDataActions.removeEntity({ targets: ptns }));
    yield put(selectingDataActions.unrenderAsset({ assetId }));
    yield put(plaskProjectActions.unrenderAsset({ assetId }));
    yield put(removeIKAction(assetId));
  }
}
