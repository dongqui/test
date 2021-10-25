import { ClusteredTimes, SelectedKeyframe } from 'types/TP_New/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { getBinarySearch } from 'utils/TP';

import HorizontalSelection from './horizontal/BoneKeyframe';
import VerticalSelection from './vertical/Keyframe';
import MultipleClick from './multipleClick/BoneKeyframe';
import BoneKeyframeLeftClick from './leftClick/BoneKeyframe';
import { Service } from './index';
import { Repository } from '../repository';

class BoneKeyframeService implements Service {
  private readonly state: KeyframesState;
  private readonly payload: SelectKeyframes;
  private readonly layerRepository: Repository;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(
    state: KeyframesState,
    payload: SelectKeyframes,
    layerRepository: Repository,
    boneRepository: Repository,
    transformRepository: Repository,
  ) {
    this.state = state;
    this.payload = payload;
    this.layerRepository = layerRepository;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  // 선택 효과가 적용 된 키프레임을 클릭했는지 확인
  private checkExistedTime = () => {
    const { state, payload } = this;
    const selectedKeyframe = payload.selectedKeyframes as SelectedKeyframe;
    const trackIndex = getBinarySearch<ClusteredTimes>({
      collection: state.selectedBoneKeyframes,
      index: selectedKeyframe.trackIndex as number,
      key: 'trackIndex',
    });
    if (trackIndex !== -1) {
      const timeIndex = getBinarySearch({
        collection: state.selectedBoneKeyframes[trackIndex].times,
        index: selectedKeyframe.timeIndex,
      });
      return timeIndex !== -1;
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

  // 다중 선택
  private selectMultipleClick = () => {
    const { state, payload } = this;
    const { selectExistedByMultipleClick, selectNotExistedByMultipleClick } = new MultipleClick();
    return this.checkExistedTime()
      ? selectExistedByMultipleClick({ state, payload })
      : selectNotExistedByMultipleClick({ state, payload });
  };

  // 좌클릭
  private selectLeftClick = () => {
    const leftClick = new BoneKeyframeLeftClick();
    return leftClick.selectByLeftClick({ payload: this.payload });
  };

  // 이벤트 타입 선택
  public selectEventType = () => {
    if (this.payload.selectType === 'horizontal') {
      return this.excuteHorizontalSelection();
    }
    if (this.payload.selectType === 'vertical') {
      return this.excuteVerticalSelection();
    }
    if (this.payload.selectType === 'multiple') {
      return this.selectMultipleClick();
    }
    return this.selectLeftClick();
  };

  // state 업데이트
  public updateKeyframesState = (selectedKeyframes: AllSelectedKeyframes) => {
    const layerKeyframes = this.layerRepository.updateKeyframes(selectedKeyframes);
    const boneKeyframes = this.boneRepository.updateKeyframes(selectedKeyframes);
    const transformKeyframes = this.transformRepository.updateKeyframes(selectedKeyframes);
    return this.boneRepository.updateState({
      ...layerKeyframes,
      ...boneKeyframes,
      ...transformKeyframes,
      ...selectedKeyframes,
    });
  };
}

export default BoneKeyframeService;
