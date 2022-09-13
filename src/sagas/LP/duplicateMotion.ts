import { find, omitBy } from 'lodash';
import { select, put, call } from 'redux-saga/effects';
import produce from 'immer';

import { RootState } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { ServerAnimationLayerRequest, ServerAnimationRequest, ServerAnimationLayer, ServerAnimation, ServerAnimationResponse } from 'types/common';
import { RequestNodeResponse } from 'types/LP';
import * as api from 'api';
import { convertServerResponseToNode } from 'utils/LP/converters';

export default function* handleDuplicateMotion(action: ReturnType<typeof lpNodeActions.duplicateMotionAsync.request>) {
  const { lpNode }: RootState = yield select();
  const { nodeId } = action.payload;
  const motionNode = find(lpNode.nodes, { id: nodeId });

  try {
    yield put(globalUIActions.openModal('LoadingModal', { title: 'Importing the file', message: 'This can take up to 3 minutes' }));

    const animation: ServerAnimationResponse = yield call(api.getAnimation, motionNode?.animationId!);
    console.log('====');
    console.log(animation);
    // TODO: resolve ts
    // @ts-ignore
    const animationLayersWithoutUid: ServerAnimationLayerRequest[] = animation?.scenesLibraryModelAnimationLayers.map((layer) =>
      omitBy(layer, (value, key) => key === 'uid' || key === 'scenesLibraryModelAnimationId' || key === 'id'),
    );
    // @ts-ignore
    const animationWithoutUid: ServerAnimationRequest = omitBy(animation, (value, key) => key === 'scenesLibraryModelAnimationLayers' || key === 'uid');
    // @ts-ignore
    const duplicatedMotionRes: RequestNodeResponse = yield call(api.postMotion, lpNode.sceneId, motionNode?.parentId, {
      animation: animationWithoutUid,
      animationLayer: animationLayersWithoutUid,
    });
    const duplicatedMotionNode = convertServerResponseToNode(duplicatedMotionRes);

    const nextNodes = produce(lpNode.nodes, (draft) => {
      const modelNode = find(draft, { id: motionNode?.parentId });
      modelNode?.childNodeIds.push(duplicatedMotionNode.id);

      draft.push(duplicatedMotionNode);
    });
    yield put(lpNodeActions.changeNode({ nodes: nextNodes }));
  } catch (e) {
    console.log(e);
  } finally {
    yield put(globalUIActions.closeModal('LoadingModal'));
  }
}
