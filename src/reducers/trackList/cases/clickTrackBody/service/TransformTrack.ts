import { BoneTrack, TransformTrack } from 'types/TP_New/track';
import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import {
  BoneTrackList,
  TrnasformTrackList,
  SelectedBones,
  SelectedTransforms,
} from 'reducers/trackList/types';

import { Service } from './index';
import LeftClick from './LeftClick/TransformTrack';
import MultipleClick from './MultipleClick/TransformTrack';
import RightClick from './RightClick/TransformTrack';
import AllClick from './AllClick/TransformTrack';
import { Repository } from '../repository';

type TrackList = BoneTrackList & TrnasformTrackList;

class TransformTrackService extends StateUpdate implements Service {
  private readonly payload: ClickTransformTrackBody;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(
    state: TrackListState,
    payload: ClickTransformTrackBody,
    boneRepository: Repository,
    transformRepository: Repository,
  ) {
    super(state);
    this.payload = payload;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  private selectAllClick = () => {
    const { state, payload } = this;
    const { clickSelectAll, clickUnselectAll } = new AllClick();
    return payload.eventType === 'selectAll'
      ? clickSelectAll({ state, payload })
      : clickUnselectAll({ state, payload });
  };

  private selectRightClick = () => {
    const { state, payload } = this;
    const { clickRightNotSelectedTrack, clickRightSelectedTrack } = new RightClick();
    const isSelectedTrack = state.selectedTransforms.includes(payload.trackNumber);
    return isSelectedTrack
      ? clickRightSelectedTrack({ state })
      : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new MultipleClick();
    const isSelectedTrack = this.state.selectedTransforms.includes(this.payload.trackNumber);
    return isSelectedTrack
      ? multipleClick.clickMultipleSelectedTrack({ state, payload })
      : multipleClick.clickMultipleNotSelectedTrack({ state, payload });
  };

  private selectLeftClick = () => {
    const { payload } = this;
    const { clickLeft } = new LeftClick();
    return clickLeft({ payload });
  };

  selectClickType = () => {
    const { eventType } = this.payload;
    if (eventType === 'selectAll' || eventType === 'unselectAll') {
      return this.selectAllClick();
    }
    if (eventType === 'rightClick') {
      return this.selectRightClick();
    }
    if (eventType === 'multipleClick') {
      return this.selectMultipleClick();
    }
    return this.selectLeftClick();
  };

  updateTrackList = (selectedTrackList: SelectedBones & SelectedTransforms): TrackList => {
    const { selectedBones, selectedTransforms } = selectedTrackList;
    const boneTrackList = this.boneRepository.updateIsSelected(selectedBones);
    const transformTrackList = this.transformRepository.updateIsSelected(selectedTransforms);
    return {
      boneTrackList: boneTrackList as BoneTrack[],
      transformTrackList: transformTrackList as TransformTrack[],
    };
  };

  updateReducerState = (newValues: Partial<TrackListState>): TrackListState => {
    return this.updateState(newValues);
  };
}

export default TransformTrackService;
