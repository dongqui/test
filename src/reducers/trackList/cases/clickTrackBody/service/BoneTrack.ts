import { BoneTrack, TransformTrack } from 'types/TP_New/track';
import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import {
  BoneTrackList,
  TrnasformTrackList,
  SelectedBones,
  SelectedTransforms,
} from 'reducers/trackList/types';
import { StateUpdate } from 'reducers/trackList/classes';

import { Service } from './index';
import LeftClick from './LeftClick/BoneTrack';
import MultipleClick from './MultipleClick/BoneTrack';
import RightClick from './RightClick/BoneTrack';
import AllClick from './AllClick/BoneTrack';
import { Repository } from '../repository';

type TrackList = BoneTrackList & TrnasformTrackList;

class BoneTrackService extends StateUpdate implements Service {
  private readonly payload: ClickBoneTrackBody;
  private readonly boneRepository: Repository;
  private readonly transformRepository: Repository;

  constructor(
    state: TrackListState,
    payload: ClickBoneTrackBody,
    boneRepository: Repository,
    transformRepository: Repository,
  ) {
    super(state);
    this.payload = payload;
    this.boneRepository = boneRepository;
    this.transformRepository = transformRepository;
  }

  private selectAllClick = () => {
    const { state } = this;
    const { eventType } = this.payload;
    const { clickSelectAll, clickUnselectAll } = new AllClick();
    return eventType === 'selectAll' ? clickSelectAll({ state }) : clickUnselectAll();
  };

  private selectRightClick = () => {
    const { state, payload } = this;
    const { clickRightNotSelectedTrack, clickRightSelectedTrack } = new RightClick();
    const isSelectedTrack = state.selectedBones.includes(payload.trackNumber);
    return isSelectedTrack
      ? clickRightSelectedTrack({ state })
      : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new MultipleClick();
    const isSelectedTrack = this.state.selectedBones.includes(this.payload.trackNumber);
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

export default BoneTrackService;
