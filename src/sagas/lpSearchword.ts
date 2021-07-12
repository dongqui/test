import { REQUEST_SET_SEARCHWORD } from 'actions/lpSearchword';
import * as actions from 'actions/lpSearchword';
import { debounce, put } from 'redux-saga/effects';
import { LPSearchwordType } from 'types/LP';

interface SagaParams {
  type: string;
  payload: Pick<LPSearchwordType, 'word'>;
}

function* setSearchwordSaga(params: SagaParams) {
  const {
    payload: { word },
  } = params;

  yield put(actions.setSearchword({ word }));
}

export function* watchLpSearchword() {
  yield debounce(100, REQUEST_SET_SEARCHWORD, setSearchwordSaga);
}
