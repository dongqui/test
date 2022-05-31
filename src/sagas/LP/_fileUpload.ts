import { put, SagaReturnType, take } from 'redux-saga/effects';
import { channel } from 'redux-saga';

import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as modeSelectActions from 'actions/modeSelection';
import { CONFIRM_01 } from 'constants/Text';

const confirmSwitchModeChannel = channel();
const isValidModelType = (name: string) => name.toLocaleLowerCase().includes('glb') || name.toLocaleLowerCase().includes('fbx');

export function* watchConfirmSwitchCModelhannel() {
  while (true) {
    const action: SagaReturnType<typeof modeSelectActions.changeMode> = yield take(confirmSwitchModeChannel);
    yield put(action);
  }
}
export default function* _fileUpload(action: ReturnType<typeof lpNodeActions._fileUpload>) {
  const { files } = action.payload;
  files.sort((a, b) => {
    if (a.type.includes('json')) {
      return -1;
    } else if (b.type.includes('json')) {
      return 1;
    } else if (isValidModelType(a.name)) {
      return -1;
    } else if (isValidModelType(b.name)) {
      return 1;
    } else {
      return 0;
    }
  });

  for (const file of files) {
    const isJson = file.name.includes('json');
    const isModelFile = isValidModelType(file.name);
    const isVideo = file.type.includes('video');

    if (isJson) {
      yield put(lpNodeActions.importMocapJson(file));
    } else if (isModelFile) {
      yield put(
        lpNodeActions.fileUpload({
          file,
          showLoading: true,
        }),
      );
    } else if (isVideo) {
      yield put(
        globalUIActions.openModal('ConfirmModal', {
          title: 'Extract',
          message: CONFIRM_01,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          onConfirm: () => {
            confirmSwitchModeChannel.put(
              modeSelectActions.changeMode({
                mode: 'videoMode',
                videoURL: URL.createObjectURL(file),
              }),
            );
          },
        }),
      );
    }
  }
}
