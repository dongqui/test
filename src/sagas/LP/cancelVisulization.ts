import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

export default function* handleCancelVisulization(action: ReturnType<typeof lpNodeActions.cancelVisulization>) {
  const { plaskProject }: RootState = yield select();
  const { visualizedAssetIds } = plaskProject;
  const { assetId, plaskEngine } = action.payload;

  if (!assetId || !visualizedAssetIds.includes(assetId)) {
    return;
  }

  plaskEngine.assetModule.unvisualizeModel(assetId);
}
