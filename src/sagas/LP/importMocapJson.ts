import { v4 as uuidv4 } from 'uuid';
import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { MocapJson, RetargetSourceBoneType } from 'types/common';
import { BONE_NAMES, TRACK_DATA_PROPERTY } from 'constants/index';

const readJsonChannel = channel();

export function* watchReadJsonChannel() {
  while (true) {
    const action: SagaReturnType<typeof lpNodeActions.changeNode> = yield take(readJsonChannel);
    yield put(action);
  }
}

export default function* importMocapJson(action: ReturnType<typeof lpNodeActions.importMocapJson>) {
  const { lpNode }: RootState = yield select();
  const mocapJsonFile = action.payload.mocapJson;

  const reader = new FileReader();
  reader.onload = function (e) {
    if (typeof e?.target?.result === 'string') {
      const json = JSON.parse(e.target.result);
      const nodes = produce(lpNode.nodes, (draft) => {
        const newMocapNode: LP.Node = {
          // parentid, filepath 수정
          id: uuidv4(),
          parentId: '__root__',
          name: mocapJsonFile.name,
          filePath: '\\root',
          childNodeIds: [],
          extension: 'json',
          type: 'Mocap',
          mocapData: json.data.result[0].trackData,
        };
        draft.push(newMocapNode);
      });
      readJsonChannel.put(lpNodeActions.changeNode({ nodes }));
    }
  };

  reader.readAsText(mocapJsonFile);
}
