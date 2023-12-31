import { TimeEditorTrack } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes, AllKeyframes } from 'reducers/keyframes/types';
import { StateUpdate } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import HorizontalSelection from './horizontal/BoneKeyframe';
import VerticalSelection from './vertical/Keyframe';
import UnselectAll from './unselectAll/Keyframe';
import MultipleClick from './multipleClick/BoneKeyframe';
import BoneKeyframeLeftClick from './leftClick/BoneKeyframe';
import { Service } from './index';
import { Repository } from '../repository';

class BoneKeyframeService extends StateUpdate implements Service {
  private readonly payload: SelectKeyframes;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(state: KeyframesState, payload: SelectKeyframes, layerRepository: Repository, boneRepository: Repository, transformRepository: Repository) {
    super(state);
    this.payload = payload;
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  // 선택 효과가 적용 된 키프레임을 클릭했는지 확인
  private checkExistedTime = () => {
    const { selectedBoneKeyframes } = this.state;
    const { trackNumber, time } = this.payload;
    const trackIndex = findElementIndex(selectedBoneKeyframes, trackNumber, 'trackNumber');
    if (trackIndex !== -1) {
      const boneKeyframes = selectedBoneKeyframes[trackIndex].keyframes;
      return findElementIndex(boneKeyframes, time, 'time') !== -1;
    }
    return false;
  };

  // 가로 전체 선택
  private excuteHorizontalSelection = () => {
    const { state, payload } = this;
    const { selectByHorizontal } = new HorizontalSelection();
    return selectByHorizontal({ state, payload });
  };

  // 세로 전체 선택
  private excuteVerticalSelection = () => {
    const { state, payload } = this;
    const { selectByVertical } = new VerticalSelection();
    return selectByVertical({ state, payload });
  };

  // 전체 선택 해제
  private runUnselectAll = () => {
    const { unselectAll } = new UnselectAll();
    return unselectAll();
  };

  // 다중 선택
  private selectMultipleClick = () => {
    const { state, payload } = this;
    const { selectExistedByMultipleClick, selectNotExistedByMultipleClick } = new MultipleClick();
    return this.checkExistedTime() ? selectExistedByMultipleClick({ state, payload }) : selectNotExistedByMultipleClick({ state, payload });
  };

  // 좌클릭
  private selectLeftClick = () => {
    const { state, payload } = this;
    const leftClick = new BoneKeyframeLeftClick();
    return leftClick.selectByLeftClick({ state, payload });
  };

  // 이벤트 타입 선택
  selectEventType = () => {
    if (this.payload.selectType === 'horizontal') {
      return this.excuteHorizontalSelection();
    }
    if (this.payload.selectType === 'vertical') {
      return this.excuteVerticalSelection();
    }
    if (this.payload.selectType === 'unselectAll') {
      return this.runUnselectAll();
    }
    if (this.payload.selectType === 'multiple') {
      return this.selectMultipleClick();
    }
    return this.selectLeftClick();
  };

  updateKeyframes = (selectedKeyframes: AllSelectedKeyframes): AllKeyframes => {
    const { selectedLayerKeyframes, selectedBoneKeyframes, selectedPropertyKeyframes } = selectedKeyframes;
    const layerTrack = this.layerRepository.updateIsSelected(selectedLayerKeyframes);
    const boneTrackList = this.boneRepository.updateIsSelected(selectedBoneKeyframes);
    const propertyTrackList = this.transformRepository.updateIsSelected(selectedPropertyKeyframes);
    return {
      layerTrack: layerTrack as TimeEditorTrack,
      boneTrackList: boneTrackList as TimeEditorTrack[],
      propertyTrackList: propertyTrackList as TimeEditorTrack[],
    };
  };

  updateReducerState = (newValues: Partial<KeyframesState>): KeyframesState => {
    return this.updateState(newValues);
  };
}

export default BoneKeyframeService;
