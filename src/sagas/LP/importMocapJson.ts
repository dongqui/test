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

function checkMocapJson(json: MocapJson) {
  if (!json.data?.result?.length) {
    new Error();
  }

  for (const mocapResult of json.data.result) {
    for (const trackData of mocapResult.trackData) {
      const isInvalidBoneName = !BONE_NAMES.includes(trackData.boneName);
      const isInvalidFpps = trackData.fps !== 30;
      const isInvalidProperty = !TRACK_DATA_PROPERTY.includes(trackData.property);

      if (isInvalidBoneName) {
        throw new Error(`${trackData.boneName} is an invalid bone name`);
      }

      if (isInvalidFpps) {
        throw new Error('FPS has to be 30');
      }

      if (isInvalidProperty) {
        throw new Error(`${trackData.property} is an invalid property`);
      }
    }
  }
}
