import { call, put, select, takeLatest } from 'redux-saga/effects';
import produce from 'immer';
import * as keyframesAction from 'actions/keyframes';
import * as animationDataActions from 'actions/animationDataAction';
import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { RootState } from 'reducers';
import setUpdatedPropertyKeyframes from './setUpdatedPropertyKeyframes';

function getSelectedPropertyKeyframes(state: RootState) {
  return state.keyframes.selectedPropertyKeyframes;
}

function getAnimationIngredients(state: RootState) {
  return state.animationData.animationIngredients;
}

// 키프레임 삭제 비즈니스 로직
function* worker() {
  const selectedPropertyKeyframes = getSelectedPropertyKeyframes(yield select());
  const updatedPropertyKeyframes: UpdatedPropertyKeyframes = yield call(setUpdatedPropertyKeyframes, selectedPropertyKeyframes, 0);
  yield put(keyframesAction.deleteKeyframes());

  // 이후부터 RP쪽 액션 호출 부분
  const { animationIngredientId: targetAnimationIngredientId, layerId: targetLayerId, transformKeys: targetTransformKeys } = updatedPropertyKeyframes;
  const animationIngredients = getAnimationIngredients(yield select());
  const targetAnimationIngredient = animationIngredients.find((animationIngredient) => animationIngredient.id === targetAnimationIngredientId);
  if (targetAnimationIngredient) {
    const newAnimationIngredient = produce(targetAnimationIngredient, (draft) => {
      targetTransformKeys.forEach((targetTransformKey) => {
        const targetTrack = draft.tracks.find((track) => track.id === targetTransformKey.trackId);
        if (targetTrack) {
          // delete의 경우 from === to
          targetTrack.transformKeys = targetTrack.transformKeys.filter((transformKey) => transformKey.frame !== targetTransformKey.from);

          // rotation track의 경우 rotationQuaternion track도 함께 변경해줘야 함
          if (targetTrack.property === 'rotation') {
            const peerTrack = draft.tracks.find((track) => track.id === targetTransformKey.trackId.replace('//rotation', '//rotationQuaternion'));
            if (peerTrack) {
              peerTrack.transformKeys = peerTrack.transformKeys.filter((transformKey) => transformKey.frame !== targetTransformKey.from);
            }
          }
        }
      });
    });
    yield put(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
  }
}

// 키프레임 드래그 드랍 입력 감지
function* watchDeleteframes() {
  yield takeLatest(keyframesAction.ENTER_KEYFRAME_DELETE_KEY, worker);
}

export default watchDeleteframes;
