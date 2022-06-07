import { BoneTrack, PropertyTrack } from 'types/TP/track';
import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { BoneTrackList, PropertyTrackList, SelectedBones, SelectedProperties } from 'reducers/trackList/types';
import { StateUpdate } from 'reducers/trackList/classes';

import { Service } from './index';
import LeftClick from './LeftClick/BoneTrack';
import MultipleClick from './MultipleClick/BoneTrack';
import RightClick from './RightClick/BoneTrack';
import AllClick from './AllClick/BoneTrack';
import { Repository } from '../repository';

type TrackList = BoneTrackList & PropertyTrackList;

class BoneTrackService extends StateUpdate implements Service {
  private readonly payload: ClickBoneTrackBody;
  private readonly boneRepository: Repository;
  private readonly propertyRepository: Repository;

  constructor(state: TrackListState, payload: ClickBoneTrackBody, boneRepository: Repository, propertyRepository: Repository) {
    super(state);
    this.payload = payload;
    this.boneRepository = boneRepository;
    this.propertyRepository = propertyRepository;
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
    return isSelectedTrack ? clickRightSelectedTrack({ state }) : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new MultipleClick();
    const isSelectedTrack = this.state.selectedBones.includes(this.payload.trackNumber);
    return isSelectedTrack ? multipleClick.clickMultipleSelectedTrack({ state, payload }) : multipleClick.clickMultipleNotSelectedTrack({ state, payload });
  };

  private selectLeftClick = () => {
    const { payload, state } = this;
    const { clickLeft } = new LeftClick();
    return clickLeft({ state, payload });
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

  updateTrackList = (selectedTrackList: SelectedBones & SelectedProperties): TrackList => {
    const { selectedBones, selectedProperties } = selectedTrackList;
    const boneTrackList = this.boneRepository.updateIsSelected(selectedBones);
    const propertyTrackList = this.propertyRepository.updateIsSelected(selectedProperties);
    return {
      boneTrackList: boneTrackList as BoneTrack[],
      propertyTrackList: propertyTrackList as PropertyTrack[],
    };
  };

  updateReducerState = (newValues: Partial<TrackListState>): TrackListState => {
    return this.updateState(newValues);
  };
}

export default BoneTrackService;
