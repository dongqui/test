import { KeyframesState } from 'reducers/keyframes';
import { KeyframesUnion, SelectedKeyframesUnion } from 'reducers/keyframes/types';

export interface Repository {
  /**
   * @description 선택 된 키프레임 중에서 isDeleted를 true로 변경
   */
  deleteSeletedKeyframes(): KeyframesUnion;

  /**
   * @description 선택 된 키프레임 리스트를 초기화
   */
  clearSeletedKeyframes(): SelectedKeyframesUnion;

  updateStateObject(newValues: Partial<KeyframesState>): KeyframesState;
}

export interface RepositoryConstructor {
  new (state: KeyframesState): Repository;
}
