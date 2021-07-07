import * as lpDataActions from 'actions/lpData';
import * as currentVisualizedDataActions from 'actions/currentVisualizedData';
import { put, takeLatest, delay } from 'redux-saga/effects';
import {
  RequestExpandedKey,
  RequestVisualize,
  REQUEST_EXPANDED_KEY,
  REQUEST_VISUALIZE,
} from 'actions/lpData';
import _ from 'lodash';

interface SetExpandedKeySaga {
  type: string;
  payload: RequestExpandedKey;
}
function* setExpandedKeySaga(params: SetExpandedKeySaga) {
  yield delay(500);
  const {
    payload: { isExpand, key },
  } = params;

  yield put(lpDataActions.setExpandedKey({ key, isExpand }));
}

interface VisualizeSaga {
  type: string;
  payload: RequestVisualize;
}
function* visualizeSaga(params: VisualizeSaga) {
  const {
    payload: { key, data },
  } = params;

  let newVisualizedKey = key;
  const targetRow = data.find((item) => item.key === newVisualizedKey);
  if (targetRow?.type === 'Folder') {
    return;
  }
  if (targetRow?.type === 'File') {
    const childRows = data.filter((item) => item.parentKey === targetRow.key);
    if (childRows) {
      // 하위 모션중 첫번째를 visualize 시킨다
      newVisualizedKey = childRows[0].key;
    }
  }

  const newVisualizedRow = data.find((item) => item.key === newVisualizedKey);

  if (newVisualizedRow) {
    yield put(lpDataActions.visualize({ keys: [newVisualizedKey] }));
    yield put(
      currentVisualizedDataActions.setCurrentVisualizedData({
        data: {
          key: newVisualizedRow.key,
          name: newVisualizedRow.name,
          type: newVisualizedRow.type,
          boneNames: newVisualizedRow.boneNames,
          baseLayer: newVisualizedRow.baseLayer,
          layers: newVisualizedRow.layers,
          url: newVisualizedRow.url,
        },
      }),
    );
  }
}

export function* watchLpData() {
  yield takeLatest(REQUEST_EXPANDED_KEY, setExpandedKeySaga);
  yield takeLatest(REQUEST_VISUALIZE, visualizeSaga);
}
