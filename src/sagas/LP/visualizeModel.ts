import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';
import { find } from 'lodash';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as TEXT from 'constants/Text';
import { PlaskProject } from 'types/common/index';
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
  const plaskProjectSelector = (state: RootState) => state.plaskProject;

  try {
    const { modelNode, animationIngredientId } = action.payload;

    if (!modelNode.childNodeIds.length) {
      yield put(lpNodeActions.addEmptyMotionAsnyc.request({ assetId: modelNode.assetId!, nodeId: modelNode.id }));
      yield take('ADDED_EMPTY_MOTION');
    }

    const plaskProject: PlaskProject = yield select(plaskProjectSelector);
    const { visualizedAssetIds, assetList } = plaskProject;

    const asset = find(assetList, { id: modelNode.assetId });
    if (!asset) {
      yield put(lpNodeActions.addAssetsAndAnimationIngredients(modelNode));
      yield take('ADDED_NEW_ASSET');
    }

    const isAnotherAssetVisualized = visualizedAssetIds.length > 0 && visualizedAssetIds[0] !== modelNode.assetId;
    if (isAnotherAssetVisualized) {
      const prevAssetId = visualizedAssetIds[0];
      plaskEngine.assetModule.clearAssetFromScene(prevAssetId);
      yield put(selectingDataActions.unrenderAsset({ assetId: prevAssetId }));
    }
    // visualize new asset
    const newPlaskProject: PlaskProject = yield select(plaskProjectSelector);
    if (modelNode?.assetId && !visualizedAssetIds.includes(modelNode.assetId)) {
      const asset = find(newPlaskProject.assetList, { id: modelNode.assetId });
      if (asset?.animationIngredientIds[0]) {
        yield put(
          animationDataActions.changeCurrentAnimationIngredient({ assetId: modelNode.assetId, animationIngredientId: animationIngredientId || asset?.animationIngredientIds[0] }),
        );
        plaskEngine.assetModule.visualizeModel(modelNode.assetId, clickJointChannel);
      }
    }
  } catch (e) {
    console.log(e);
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
