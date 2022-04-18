import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import { PlaskAsset } from '3d/entities/PlaskAsset';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

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
    const visualizedAssets = plaskEngine.getEntitiesByPredicate((entity) => entity.className == 'PlaskAsset' && (entity as PlaskAsset).assetId === visualizedAssetIds[0]);

    // TODO : redundant with what's below
    let currentVisualizedAsset = visualizedAssets[0] as PlaskAsset;
    if (!currentVisualizedAsset) {
      currentVisualizedAsset = new PlaskAsset();
    } else {
      currentVisualizedAsset = currentVisualizedAsset.clone();
    }
    currentVisualizedAsset.assetId = assetId;

    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      // Find transform node
      const ptns = plaskEngine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id.includes(prevAssetId));
      yield put(selectingDataActions.removeEntity({ targets: ptns }));

      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
      yield put(plaskProjectActions.unrenderAsset({ assetId }));
    }

    // visualize new asset
    yield put(selectingDataActions.addEntity({ targets: [currentVisualizedAsset] }));

    if (assetId && !visualizedAssetIds.includes(assetId)) {
      // TODO: simplify call with asset from assetList
      const plaskTransformNodes = plaskEngine.assetModule.generatePlaskTransformNodes(assetId);
      yield put(selectingDataActions.addEntity({ targets: plaskTransformNodes }));
      // This appends PlaskTransformNodes to state.selectableObjects
      yield put(selectingDataActions.updateSelectableObjects({ objects: plaskTransformNodes }));

      // This only sets state.visualizedAssetIds
      yield put(plaskProjectActions.renderAsset({ assetId }));
    }
    action.payload.onSuccess();
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
