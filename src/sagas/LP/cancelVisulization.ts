import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import plaskEngine from '3d/PlaskEngine';

export default function* handleCancelVisulization(action: ReturnType<typeof lpNodeActions.cancelVisulization>) {
  const { plaskProject }: RootState = yield select();
  const { visualizedAssetIds } = plaskProject;
  const { assetId } = action.payload;

  if (!assetId || !visualizedAssetIds.includes(assetId)) {
    return;
  }

  plaskEngine.assetModule.unvisualizeModel(assetId);
}
