import { REQUEST_SET_SEARCHWORD } from 'actions/lpSearchword';
import * as actions from 'actions/lpData';
import { put, takeLatest, delay } from 'redux-saga/effects';
import { RequestExpandedKey, REQUEST_EXPANDED_KEY } from 'actions/lpData';

interface SagaParams {
  type: string;
  payload: RequestExpandedKey;
}

function* setExpandedKeySaga(params: SagaParams) {
  yield delay(500);
  const {
    payload: { isExpand, key },
  } = params;

  yield put(actions.setExpandedKey({ key, isExpand }));
}

export function* watchLpData() {
  yield takeLatest(REQUEST_EXPANDED_KEY, setExpandedKeySaga);
}
