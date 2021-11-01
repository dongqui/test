import { TrackIdentifier } from 'types/TP';

export type KeyframesAction =
  | ReturnType<typeof selectKeyframes>
  | ReturnType<typeof addKeyframes>
  | ReturnType<typeof copyKeyframes>
  | ReturnType<typeof createKeyframes>
  | ReturnType<typeof deleteKeyframes>
  | ReturnType<typeof dragDropKeyframes>
  | ReturnType<typeof pasteKeyframes>;

// 키프레임 선택
export interface SelectKeyframes extends TrackIdentifier {
  time: number;
  selectType: 'left' | 'multiple' | 'vertical' | 'horizontal' | 'dragBox' | 'unselectAll';
}
export const selectKeyframes = (params: SelectKeyframes) => ({
  type: 'keyframes/SELECT_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});

// 키프레임 추가
export const addKeyframes = (params: any) => ({
  type: 'keyframes/ADD_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});

// 키프레임 복사
export const copyKeyframes = (params: any) => ({
  type: 'keyframes/COPY_KEYFRAMES' as const,
  payload: {
    ...params,
  },
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
export const dragDropKeyframes = (params: any) => ({
  type: 'keyframes/DRAG_DROP_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});

// 키프레임 붙이기
export const pasteKeyframes = (params: any) => ({
  type: 'keyframes/PASTE_KEYFRAMES' as const,
  payload: {
    ...params,
  },
});
