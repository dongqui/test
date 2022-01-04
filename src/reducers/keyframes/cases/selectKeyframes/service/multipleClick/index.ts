import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';

interface Params {
  state?: KeyframesState;
  payload?: SelectKeyframes;
}

export interface MultipleClick {
  /**
   * @description 기존에 선택 효과가 적용 된 키프레임을 선택
   */
  selectExistedByMultipleClick(params: Params): AllSelectedKeyframes;

  /**
   * @description 기존에 선택 효과가 적용되지 않은 키프레임을 선택
   */
  selectNotExistedByMultipleClick(params: Params): AllSelectedKeyframes;
}
