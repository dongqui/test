import { PlaskTrack } from 'types/common';
import { TrackIdentifier } from 'types/TP';

export type KeyframesAction =
  | ReturnType<typeof initializeKeyframes>
  | ReturnType<typeof selectKeyframes>
  | ReturnType<typeof selectKeyframesByDragBox>
  | ReturnType<typeof addKeyframes>
  | ReturnType<typeof copyKeyframes>
  | ReturnType<typeof createKeyframes>
  | ReturnType<typeof deleteKeyframes>
  | ReturnType<typeof dragDropKeyframes>
  | ReturnType<typeof paste>;

// 키프레임 생성
export interface InitializeKeyframes {
  list: PlaskTrack[];
  clearAnimation?: boolean;
}
export const initializeKeyframes = (params: InitializeKeyframes) => ({
  type: 'keyframes/INITIALIZE_KEYFRAMES' as const,
  payload: { ...params },
});

// 키프레임 삭제 단축키 입력
export const ENTER_KEYFRAME_DELETE_KEY = 'keyframes/ENTER_KEYFRAME_DELETE_KEY' as const;
export const enterKeyframeDeleteKey = () => ({
  type: ENTER_KEYFRAME_DELETE_KEY,
});

// 키프레임 드래그 드랍 키 입력
export interface EnterKeyframeDragDropKey {
  timeDiff: number;
}
export const ENTER_KEYFRAME_DRAG_DROP_KEY = 'keyframes/ENTER_KEYFRAME_DRAG_DROP_KEY' as const;
export const enterKeyframeDragDropKey = (params: EnterKeyframeDragDropKey) => ({
  type: ENTER_KEYFRAME_DRAG_DROP_KEY,
  payload: { ...params },
});

// 키프레임 붙이기 키 입력
export const ENTER_PASTE_KEY = 'keyframes/ENTER_PASTE_KEY' as const;
export const enterPasteKey = () => ({
  type: 'keyframes/ENTER_PASTE_KEY' as const,
});

// 키프레임 선택
export interface SelectKeyframes extends TrackIdentifier {
  time: number;
  selectType: 'left' | 'multiple' | 'vertical' | 'horizontal' | 'unselectAll';
}
export const selectKeyframes = (params: SelectKeyframes) => ({
  type: 'keyframes/SELECT_KEYFRAMES' as const,
  payload: { ...params },
});

// 드래그 박스로 키프레임 선택
export interface SelectKeyframesByDragBox {
  trackNumber: number;
  time: number;
}
export const selectKeyframesByDragBox = (params: SelectKeyframesByDragBox[]) => ({
  type: 'keyframes/SELECT_KEYFRAMES_BY_DRAG_BOX' as const,
  payload: params,
});

// 키프레임 추가
export const addKeyframes = (params: any) => ({
  type: 'keyframes/ADD_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});

// 키프레임 복사
export const copyKeyframes = () => ({
  type: 'keyframes/COPY_KEYFRAMES' as const,
});

// 키프레임 생성
export const createKeyframes = (params: any) => ({
  type: 'keyframes/CREATE_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});

// 키프레임 삭제
export const deleteKeyframes = () => ({
  type: 'keyframes/DELETE_KEYFRAMES' as const,
});

// 키프레임 드래드 드랍
export interface DragDropKeyframes {
  timeDiff: number;
}
export const dragDropKeyframes = (params: DragDropKeyframes) => ({
  type: 'keyframes/DRAG_DROP_KEYFRAMES' as const,
  payload: { ...params },
});

// 키프레임 붙이기
export interface Paste {
  currentTimeIndex: number;
}
export const PASTE = 'keyframes/PASTE' as const;
export const paste = (params: Paste) => ({
  type: PASTE,
  payload: {
    ...params,
  },
});
