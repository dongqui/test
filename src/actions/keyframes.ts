import { PlaskTrack, VectorTransformKey, QuaternionTransformKey } from 'types/common';
import { TrackIdentifier } from 'types/TP';
import { UpdatedPropertyKeyframes } from 'types/TP/keyframe';
import { createSocketActions } from './helper';

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
export const addKeyframes = (params: UpdatedPropertyKeyframes) => ({
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

interface deleteKeyframesRequestParams {}
interface deleteKeyframesSendParams {
  type: 'delete-frames';
  data: {
    layerId: '6oo3jg40ex12npvn1p7yk89ld65mzqrz';
    tracks: {
      trackId: string;
      frames: number[];
    }[];
  };
}
interface deleteKeyframesReceiveParams {}
// 키프레임 삭제
export const deleteKeyframes = () => ({
  type: 'keyframes/DELETE_KEYFRAMES' as const,
});
export const deleteKeyframesSocket = createSocketActions(
  'keyframes/DELETE_KEYFRAMES_REQUEST',
  'keyframes/DELETE_KEYFRAMES_SEND',
  'keyframes/DELETE_KEYFRAMES_RECEIVE',
  'keyframes/DELETE_KEYFRAMES_UPDATE',
  'keyframes/DELETE_KEYFRAMES_FAILURE',
)<deleteKeyframesRequestParams, deleteKeyframesSendParams, deleteKeyframesReceiveParams, undefined, Error>();

interface editKeyframesRequestParams {}
interface editKeyframesSendParams {
  type: 'put-frames';
  data: {
    layerId: string;
    tracks: {
      trackId: string;
      frame: {
        frameIndex: number;
        property: string;
        transformKey: VectorTransformKey | QuaternionTransformKey;
      };
    }[];
  };
}
interface editKeyframesReceiveParams {}
export const editKeyframesSocket = createSocketActions(
  'keyframes/EDIT_KEYFRAMES_REQUEST',
  'keyframes/EDIT_KEYFRAMES_SEND',
  'keyframes/EDIT_KEYFRAMES_RECEIVE',
  'keyframes/EDIT_KEYFRAMES_UPDATE',
  'keyframes/EDIT_KEYFRAMES_FAILURE',
)<editKeyframesRequestParams, editKeyframesSendParams, editKeyframesReceiveParams, undefined, Error>();

// 키프레임 드래드 드랍
export interface DragDropKeyframes {
  timeDiff: number;
}
export const dragDropKeyframes = (params: DragDropKeyframes) => ({
  type: 'keyframes/DRAG_DROP_KEYFRAMES' as const,
  payload: { ...params },
});

interface MoveKeyframesRequestParams {
  timeDiff: number;
}
interface MoveKeyframesSendParams {
  type: 'move-frames';
  data: {
    layerId: string;
    tracks: {
      trackId: string;
      frames: {
        frameIndexFrom: number;
        frameIndexTo: number;
      }[];
    }[];
  };
}
interface MoveKeyframesReceiveParams {}

export const moveKeyframesSocket = createSocketActions(
  'keyframes/MOVE_KEYFRAMES_REQUEST',
  'keyframes/MOVE_KEYFRAMES_SEND',
  'keyframes/MOVE_KEYFRAMES_RECEIVE',
  'keyframes/MOVE_KEYFRAMES_UPDATE',
  'keyframes/MOVE_KEYFRAMES_FAILURE',
)<MoveKeyframesRequestParams, MoveKeyframesSendParams, MoveKeyframesReceiveParams, undefined, Error>();

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

interface PasteKeyframesRequestParams {}
interface PasteKeyframesSendParams extends editKeyframesSendParams {}
interface PasteKeyframesReceiveParams {}

export const pasteKeyframesSocket = createSocketActions(
  'keyframes/PASTE_KEYFRAMES_REQUEST',
  'keyframes/PASTE_KEYFRAMES_SEND',
  'keyframes/PASTE_KEYFRAMES_RECEIVE',
  'keyframes/PASTE_KEYFRAMES_UPDATE',
  'keyframes/PASTE_KEYFRAMES_FAILURE',
)<PasteKeyframesRequestParams, PasteKeyframesSendParams, PasteKeyframesReceiveParams, undefined, Error>();
