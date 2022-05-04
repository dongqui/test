import { v4 as uuidv4 } from 'uuid';
import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';
import produce from 'immer';
import { isEqual } from 'lodash';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { MocapJson } from 'types/common';
import { BONE_NAMES, TRACK_DATA_PROPERTY } from 'constants/index';

const readJsonChannel = channel();

export function* watchReadJsonChannel() {
  while (true) {
    const action: SagaReturnType<typeof globalUIActions.openModal> = yield take(readJsonChannel);
    yield put(action);
  }
}

export default function* importMocapJson(action: ReturnType<typeof lpNodeActions.importMocapJson>) {
  const { lpNode }: RootState = yield select();
  const mocapJsonFile = action.payload.mocapJson;

  const reader = new FileReader();

  reader.onload = function (e) {
    if (typeof e?.target?.result === 'string') {
      try {
        const json = JSON.parse(e.target.result);
        checkMocapJson(json);

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
      } catch (e) {
        readJsonChannel.put(
          globalUIActions.openModal('_AlertModal', {
            message: 'Please check the structure of the json file.',
            title: 'Import failed',
            footerButtonText: 'Learn More',
            onClickFooterButton: function () {
              window.open('https://plasticmask.notion.site/Plask-JSON-structure-2e9e24b944b64de38029b59b38f0a5ef', '_blank');
            },
          }),
        );
      }
    }
  };

  reader.readAsText(mocapJsonFile);
}

function checkMocapJson(json: MocapJson) {
  if (!json.data?.result?.length) {
    new Error('This json is invalid');
  }

  for (const mocapResult of json.data.result) {
    const hasInvalidBoneName = !isEqual(['hips', ...BONE_NAMES].sort(), mocapResult.trackData.map((data) => data.boneName).sort());

    if (hasInvalidBoneName) {
      throw new Error('This json has invalid bone names');
    }
    for (const trackData of mocapResult.trackData) {
      const isInvalidFpps = trackData.fps !== 30;
      const isInvalidProperty = !TRACK_DATA_PROPERTY.includes(trackData.property);
      const hasInvalidTransformKey = trackData.transformKeys.some((key) => isInvalidTransformKey(key, trackData.property === 'position'));

      if (isInvalidFpps) {
        throw new Error('FPS has to be 30');
      }

      if (isInvalidProperty) {
        throw new Error(`${trackData.property} is an invalid property`);
      }

      if (hasInvalidTransformKey) {
        throw new Error('This json has invalid transformkey');
      }
    }
  }
}

interface TransfromKey {
  frame: number;
  time: number;
  value: number[];
}

function isInvalidTransformKey(transformKey: TransfromKey, isPosition: boolean = false) {
  return typeof transformKey?.frame !== 'number' || typeof transformKey?.time !== 'number' || isPosition
    ? transformKey?.value.length !== 3
    : transformKey?.value.length !== 4 || transformKey?.value.some((key) => typeof key !== 'number');
}
