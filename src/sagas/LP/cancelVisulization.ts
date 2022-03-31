import { select, put } from 'redux-saga/effects';

import { RootState } from 'reducers';
import { checkIsTargetMesh, removeAssetFromScene } from 'utils/RP';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';

export default function* handleCancelVisulization(action: ReturnType<typeof lpNodeActions.cancelVisulization>) {
  const { plaskProject, selectingData }: RootState = yield select();
  const { visualizedAssetIds, assetList, screenList } = plaskProject;
  const { selectableObjects } = selectingData.present;
  const { assetId } = action.payload;

  if (!assetId || !visualizedAssetIds.includes(assetId)) {
    return;
  }

  const targetAsset = assetList.find((asset) => asset.id === assetId);
  const targetJointTransformNodes = selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'joint');
  const targetControllers = selectableObjects.filter((object) => object.id.includes(assetId) && object.type === 'controller');
  if (targetAsset) {
    screenList
      .map((screen) => screen.scene)
      .forEach((scene) => {
        removeAssetFromScene(scene, targetAsset, targetJointTransformNodes, targetControllers);
      });
  }
  yield put(plaskProjectActions.unrenderAsset({ assetId }));
  yield put(selectingDataActions.unrenderAsset({ assetId }));
}
