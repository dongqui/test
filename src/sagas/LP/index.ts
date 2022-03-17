import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { takeLatest, all, takeEvery } from 'redux-saga/effects';
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
import handleDeleteModel from './deleteModel';
import handleDeleteFolderOrMocap from './deleteFolderOrMocap';
import handleFileUpload from './fileUpload';
import handleDropNodeOnRoot from './dropNodeOnRoot';

export default function* LPSaga() {
  yield all([
    takeLatest(lpNodeActions.ADD_DIRECTORY, handleAddDirectory),
    takeLatest(lpNodeActions.VISUALIZE_NODE, handleVisualizeModel),
    takeLatest(lpNodeActions.CANCEL_VISUALIZATION, handleCancelVisulization),
    takeLatest(lpNodeActions.ADD_EMPTY_MOTION, handleAddEmptyMotion),
    takeLatest(lpNodeActions.DUPLICATE_MOTION, handleDuplicateMotion),
    takeLatest(lpNodeActions.VISUALIZE_MOTION, handleVisualizeMotion),
    takeLatest(lpNodeActions.DROP_NODE_ON_FOLDER, handleDropNodeOnFolder),
    takeLatest(lpNodeActions.DROP_MOCAP_ON_MODEL, handleDropMocapOnModel),
    takeLatest(lpNodeActions.EDIT_NODE_NAME, handleEditNodeName),
    takeLatest(lpNodeActions.EXPORT_ASSET, handleExportAsset),
    takeLatest(lpNodeActions.DELETE_MOTION, handleDeleteMotion),
    takeLatest(lpNodeActions.DELETE_MODEL, handleDeleteModel),
    takeLatest(lpNodeActions.DELETE_FOLDER_OR_MOCAP, handleDeleteFolderOrMocap),
    takeEvery(lpNodeActions.FILE_UPLOAD, handleFileUpload),
    takeEvery(lpNodeActions.DROP_NODE_ON_ROOT, handleDropNodeOnRoot),
    watchClickJointChannel(),
  ]);
}
