import * as KeyframeActions from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';

export interface DragBox {
  selectKeyframeByDragBox(payload: KeyframeActions.SelectKeyframesByDragBox[]): Partial<KeyframesState>;
}
