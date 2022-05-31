import { takeLatest, all, takeEvery } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import handleAddDirectory from './addDirectory';
import { handleVisualizeModel, watchClickJointChannel } from './visualizeModel';
import handleVisualizeMotion from './visualizeMotion';
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

export default function* LPSaga() {
  yield all([
    takeLatest(getType(lpNodeActions.visualizeModel), handleVisualizeModel),
    takeLatest(getType(lpNodeActions.cancelVisulization), handleCancelVisulization),
    takeLatest(getType(lpNodeActions.addEmptyMotionAsnyc.request), handleAddEmptyMotion),
    takeLatest(getType(lpNodeActions.duplicateMotion), handleDuplicateMotion),
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
    watchClickJointChannel(),
    watchDeleteNodeSocketActions(),
    watchMoveNodeSocketActions(),
    watchEditNodeNameSocketActions(),
    watchReadJsonChannel(),
    watchConfirmSwitchCModelhannel(),
  ]);
}
