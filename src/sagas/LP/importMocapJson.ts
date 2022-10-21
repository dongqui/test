import { channel } from 'redux-saga';
import { select, put, SagaReturnType, take } from 'redux-saga/effects';
import { isEqual } from 'lodash';
import TagManager from 'react-gtm-module';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { MocapJson } from 'types/common';
import { BONE_NAMES, TRACK_DATA_PROPERTY } from 'constants/index';
import * as api from 'api';
import { convertServerResponseToNode, setChildNodeIds } from 'utils/LP/converters';
import { TOOL_PAYMENT_MAXIMUM_SIZE } from 'errors';
import PlanManager from 'utils/PlanManager';

const readJsonChannel = channel();

// delete this comment
export function* watchReadJsonChannel() {
  while (true) {
    const action: SagaReturnType<typeof globalUIActions.openModal | typeof globalUIActions.closeModal> = yield take(readJsonChannel);
    yield put(action);
  }
}

export default function* importMocapJson(action: ReturnType<typeof lpNodeActions.importMocapJson>) {
  const { lpNode, user }: RootState = yield select();
  const mocapJsonFile = action.payload;

  const reader = new FileReader();

  reader.onload = async function (e) {
    if (typeof e?.target?.result === 'string') {
      try {
        const json: MocapJson = JSON.parse(e.target.result);
        checkMocapJson(json);

        readJsonChannel.put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }, 'importJson'));

        const { fileKey } = await api.upload(mocapJsonFile);

        const reponseNodes = await api.addMocapByJson(lpNode.sceneId, {
          name: mocapJsonFile.name,
          fileKey,
        });

        const nodes = (Array.isArray(reponseNodes) ? reponseNodes : [reponseNodes]).map(convertServerResponseToNode);
        setChildNodeIds(nodes);

        readJsonChannel.put(lpNodeActions.addNodes(nodes));
        TagManager.dataLayer({
          dataLayer: {
            event: 'import_success',
            type: 'other',
          },
        });
      } catch (e: any) {
        if (e.statusCode === TOOL_PAYMENT_MAXIMUM_SIZE) {
          PlanManager.openStorageExceededModal(user);
        } else {
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
      } finally {
        readJsonChannel.put(globalUIActions.closeModal('importJson'));
      }
    }
  };

  reader.readAsText(mocapJsonFile);
}

function checkMocapJson(json: MocapJson) {
  if (!json?.result?.length) {
    new Error('This json is invalid');
  }

  for (const mocapResult of json.result) {
    const boneNamesWithContact = ['hips', 'leftFoot', 'rightFoot', 'leftToeBase', 'rightToeBase', ...BONE_NAMES];
    const basicBonNames = ['hips', ...BONE_NAMES];
    const jsonBonnames = mocapResult.trackData.map((data) => data.boneName);
    const hasInvalidBoneName = !isEqual(basicBonNames.sort(), jsonBonnames.sort()) && !isEqual(boneNamesWithContact.sort(), jsonBonnames.sort());

    if (hasInvalidBoneName) {
      throw new Error('This json has invalid bone names');
    }
    for (const trackData of mocapResult.trackData) {
      const isInvalidProperty = !TRACK_DATA_PROPERTY.includes(trackData.property);

      // TODO : reinstate
      // const hasInvalidTransformKey = trackData.transformKeys.some((key) => isInvalidTransformKey(key, trackData.property === 'position'));

      if (isInvalidProperty) {
        throw new Error(`${trackData.property} is an invalid property`);
      }

      // if (hasInvalidTransformKey) {
      //   throw new Error('This json has invalid transformkey');
      // }
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
