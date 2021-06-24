import { REQUEST_SET_SEARCHWORD } from 'actions/lpSearchword';
import * as actions from 'actions/lpSearchword';
import { debounce, put } from 'redux-saga/effects';
import { LPSearchwordType } from 'types/LP';

interface SagaParams {
  type: string;
  payload: Pick<LPSearchwordType, 'word'>;
}

function* setSearchword(params: SagaParams) {
  const { payload } = params;
  const { word } = payload;

  yield put(actions.setSearchword({ word }));
}

export function* watchLpSearchword() {
  yield debounce(100, REQUEST_SET_SEARCHWORD, setSearchword);
}
