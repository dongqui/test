import { takeLatest, all, takeEvery } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import handleAddDirectory from './addDirectory';
import { handleVisualizeModel, watchClickJointChannelFromModelVisualize } from './visualizeModel';
import handleVisualizeMotion, { watchClickJointChannelFromMotionVizsualize } from './visualizeMotion';
import handleCancelVisulization from './cancelVisulization';
import handleAddEmptyMotion from './addEmptyMotion';
import handleDuplicateMotion from './duplicateMotion';
import watchMoveNodeSocketActions from './moveNode';
import watchEditNodeNameSocketActions from './editNodeName';
import handleExportAsset from './exportAsset';
import handleDeleteMotion from './deleteMotion';
import handleDeleteModel from './deleteModel';
import watchDeleteNodeSocketActions from './deleteNode';
import handleFileUpload, { watchConfirmSwitchCModelhannel } from './fileUpload';
import handleAddModel from './addModel';
import initNodes from './initNodes';
import handleApplyMocapToModel from './applyMocapToModel';
import addAssetsAndAnimationIngredients from './addAssetsAndAnimationIngredients';
import importMocapJson, { watchReadJsonChannel } from './importMocapJson';
import handleInitDefaultSceneModelData from './initDefaultSceneModelData';

export default function* LPSaga() {
  yield all([
    takeLatest(getType(lpNodeActions.visualizeModel), handleVisualizeModel),
    takeLatest(getType(lpNodeActions.cancelVisulization), handleCancelVisulization),
    takeLatest(getType(lpNodeActions.addEmptyMotionAsync.request), handleAddEmptyMotion),
    takeLatest(getType(lpNodeActions.duplicateMotionAsync.request), handleDuplicateMotion),
    takeLatest(getType(lpNodeActions.visualizeMotion), handleVisualizeMotion),
    takeLatest(getType(lpNodeActions.exportAsset), handleExportAsset),
    takeLatest(getType(lpNodeActions.deleteMotion), handleDeleteMotion),
    takeLatest(getType(lpNodeActions.deleteModel), handleDeleteModel),
    takeEvery(getType(lpNodeActions.fileUpload), handleFileUpload),
    takeEvery(getType(lpNodeActions.initNodes), initNodes),
    takeLatest(getType(lpNodeActions.addDirectoryAsync.request), handleAddDirectory),
    takeLatest(getType(lpNodeActions.addModelAsync.request), handleAddModel),
    takeLatest(getType(lpNodeActions.applyMocapToModel.request), handleApplyMocapToModel),
    takeLatest(getType(lpNodeActions.addAssetsAndAnimationIngredients), addAssetsAndAnimationIngredients),
    takeLatest(getType(lpNodeActions.importMocapJson), importMocapJson),
    takeLatest(getType(lpNodeActions.initDefaultSceneModelData.request), handleInitDefaultSceneModelData),
    watchClickJointChannelFromMotionVizsualize(),
    watchClickJointChannelFromModelVisualize(),
    watchDeleteNodeSocketActions(),
    watchMoveNodeSocketActions(),
    watchEditNodeNameSocketActions(),
    watchReadJsonChannel(),
    watchConfirmSwitchCModelhannel(),
  ]);
}
