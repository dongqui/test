import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';

const clickJointChannel = channel();

export function* watchClickJointChannel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export function* handleVisualizeModel(action: ReturnType<typeof lpNodeActions.visualizeNode>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.
  const { plaskProject }: RootState = yield select();
  const { visualizedAssetIds } = plaskProject;
  const { assetId, plaskEngine } = action.payload;

  try {
    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== action.payload.assetId;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      plaskEngine.assetModule.clearAssetFromScene(prevAssetId);
      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    }
    // visualize new asset
    if (assetId && !visualizedAssetIds.includes(assetId)) {
      plaskEngine.assetModule.visualizeModel(assetId, clickJointChannel);
    }
    // TODO : here we can tell the callback that we are done with loading
  } catch (e) {
    yield put(
      globalUIActions.openModal('AlertModal', {
        title: 'Warning',
        message: TEXT.WARNING_08,
        confirmText: 'Close',
        confirmColor: 'negative',
      }),
    );
  }
}
