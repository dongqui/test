import { takeLatest, all, takeEvery } from 'redux-saga/effects';
import { getType } from 'typesafe-actions';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import handleAddDirectory from './addDirectory';
import { handleVisualizeModel, watchClickJointChannel } from './visualizeModel';
import handleVisualizeMotion from './visualizeMotion';
import handleCancelVisulization from './cancelVisulization';
import handleAddEmptyMotion from './addEmptyMotion';
import handleDuplicateMotion from './duplicateMotion';
import handleDropNodeOnFolder from './dropNodeOnFolder';
import handleDropMocapOnModel from './dropMocapOnModel';
import handleEditNodeName from './editNodeName';
import handleExportAsset from './exportAsset';
import handleDeleteMotion from './deleteMotion';
import waitDeleteModelSocketActions from './deleteModel';
import waitDeleteFolderOrMocapSocketActions from './deleteFolderOrMocap';
import handleFileUpload from './fileUpload';
import handleDropNodeOnRoot from './dropNodeOnRoot';
import getNodes from './getNodes';

export default function* LPSaga() {
  yield all([
    takeLatest(getType(lpNodeActions.visualizeModel), handleVisualizeModel),
    takeLatest(getType(lpNodeActions.cancelVisulization), handleCancelVisulization),
    takeLatest(getType(lpNodeActions.addEmptyMotion), handleAddEmptyMotion),
    takeLatest(getType(lpNodeActions.duplicateMotion), handleDuplicateMotion),
    takeLatest(getType(lpNodeActions.visualizeMotion), handleVisualizeMotion),
    takeLatest(getType(lpNodeActions.dropNodeOnFolder), handleDropNodeOnFolder),
    takeLatest(getType(lpNodeActions.dropMocapOnModel), handleDropMocapOnModel),
    takeLatest(getType(lpNodeActions.editNodeName), handleEditNodeName),
    takeLatest(getType(lpNodeActions.exportAsset), handleExportAsset),
    takeLatest(getType(lpNodeActions.deleteMotion), handleDeleteMotion),
    // takeLatest(getType(lpNodeActions.deleteModel), handleDeleteModel),
    // takeLatest(getType(lpNodeActions.deleteFolderOrMocap), handleDeleteFolderOrMocap),
    takeEvery(getType(lpNodeActions.fileUpload), handleFileUpload),
    takeEvery(getType(lpNodeActions.dropNodeOnRoot), handleDropNodeOnRoot),
    takeEvery(getType(lpNodeActions.getNodesAsync.request), getNodes),
    takeLatest(getType(lpNodeActions.addDirectoryAsync.request), handleAddDirectory),
    watchClickJointChannel(),
    waitDeleteFolderOrMocapSocketActions(),
    waitDeleteModelSocketActions(),
  ]);
}
