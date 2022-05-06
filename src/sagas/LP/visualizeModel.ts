import { channel } from 'redux-saga';
import { call, select, put, SagaReturnType, take } from 'redux-saga/effects';
import * as BABYLON from '@babylonjs/core';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import plaskEngine from '3d/PlaskEngine';

const clickJointChannel = channel();

export function* watchClickJointChannel() {
  while (true) {
    const action: SagaReturnType<typeof selectingDataActions.ctrlKeySingleSelect | typeof selectingDataActions.defaultSingleSelect> = yield take(clickJointChannel);
    yield put(action);
  }
}

export function* handleVisualizeModel(action: ReturnType<typeof lpNodeActions.visualizeModel>) {
  // this callback is under assumption of sing model
  // so when users visualize a model, if there is already another model visualized that model will be unvisualized.
  // @TODO if Plask support multi-model, stuff should be changed to maintain ones which are already visualized.`
  const { plaskProject }: RootState = yield select();
  const { visualizedAssetIds, screenList } = plaskProject;
  const baseScene = screenList[0].scene;
  const node = action.payload;

  try {
    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== action.payload.assetId;
    const assetContainer: BABYLON.AssetContainer = yield call([BABYLON.SceneLoader, BABYLON.SceneLoader.LoadAssetContainerAsync], node.modelUrl || '', '', baseScene);

    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      plaskEngine.assetModule.clearAssetFromScene(prevAssetId);
      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    }
    // visualize new asset
    if (node?.assetId && !visualizedAssetIds.includes(node.assetId)) {
      plaskEngine.assetModule.visualizeModel(node.assetId, clickJointChannel);
    }
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
