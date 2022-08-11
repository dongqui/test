import { put, SagaReturnType, take, select } from 'redux-saga/effects';
import { channel } from 'redux-saga';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as modeSelectActions from 'actions/modeSelection';
import * as globalUIActions from 'actions/Common/globalUI';
import TagManager from 'react-gtm-module';

const confirmSwitchModeChannel = channel();
const isValidModelType = (name: string) => name.toLocaleLowerCase().includes('glb') || name.toLocaleLowerCase().includes('fbx');

export function* watchConfirmSwitchCModelhannel() {
  while (true) {
    const action: SagaReturnType<typeof modeSelectActions.changeMode> = yield take(confirmSwitchModeChannel);
    yield put(action);
  }
}
export default function* _fileUpload(action: ReturnType<typeof lpNodeActions.fileUpload>) {
  const files = action.payload;
  const totalFileSize = files?.reduce((sum, file) => sum + file.size, 0);
  const { user }: RootState = yield select();
  const isLimitSizeOver = (user.storage?.limitSize || 0) <= (user.storage?.usageSize || 0) + totalFileSize;
  if (true || isLimitSizeOver) {
    if (!user.planName) {
      yield put(
        globalUIActions.openModal(
          'AlertModal',
          {
            title: 'Out of storage',
            message: 'Your storage is full. You won’t be able to upload new files. You can clear space in your library and free up storage space by removing your assets.',
            confirmText: 'Okay',
          },
          'upgrade',
          false,
        ),
      );
    } else {
      yield put(
        globalUIActions.openModal(
          'ConfirmModal',
          {
            title: 'Need more storage?',
            message: 'Your 1 GB of free storage is full. You won’t be able to upload new files. You can get more storage with a Mocap Pro plan.',
            confirmText: 'Upgrade',
            onConfirm: () => {
              // alert('업그럽글');
            },
          },
          'upgrade',
          false,
        ),
      );
    }
    return;
  }

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
      TagManager.dataLayer({
        dataLayer: {
          event: 'lp-file-drop',
          type: 'json',
        },
      });
      yield put(lpNodeActions.importMocapJson(file));
    } else if (isModelFile) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'lp-file-drop',
          type: 'model',
        },
      });
      yield put(lpNodeActions.addModelAsync.request(file));
    } else if (isVideo) {
      TagManager.dataLayer({
        dataLayer: {
          event: 'lp-file-drop',
          type: 'video',
        },
      });
      yield put(
        modeSelectActions.changeMode({
          mode: 'videoMode',
          videoURL: file,
        }),
      );
    }
  }
}
