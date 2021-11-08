import { select, takeLatest } from 'redux-saga/effects';
import * as actions from 'actions/shootProjectAction';
import { CHANGE_FILE_TO_LOAD, changeFileToLoad, ChangeFileToLoad } from 'actions/shootProjectAction';
import { RootState } from 'reducers';

interface SagaParams {
  type: string;
  payload: ChangeFileToLoad;
}

const getSceneList = (state: RootState) => state.shootProject.sceneList;

function* changeFileToLoadSaga(params: SagaParams) {
  const { payload } = params;

  const sceneList: ReturnType<typeof getSceneList> = yield select(getSceneList);
  console.log(sceneList);

  console.log('saga');
  console.log(payload.file, payload.fileName);
  // useLoadAssets
}

export function* watchChangeFileToLoad() {
  yield takeLatest(CHANGE_FILE_TO_LOAD, changeFileToLoadSaga);
}
