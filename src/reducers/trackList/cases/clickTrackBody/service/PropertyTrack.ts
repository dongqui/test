import { BoneTrack, PropertyTrack } from 'types/TP/track';
import { ClickPropertyTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { StateUpdate } from 'reducers/trackList/classes';
import { BoneTrackList, PropertyTrackList, SelectedBones, SelectedProperties } from 'reducers/trackList/types';

import { Service } from './index';
import LeftClick from './LeftClick/PropertyTrack';
import MultipleClick from './MultipleClick/PropertyTrack';
import RightClick from './RightClick/PropertyTrack';
import AllClick from './AllClick/PropertyTrack';
import { Repository } from '../repository';

type TrackList = BoneTrackList & PropertyTrackList;

class PropertyTrackService extends StateUpdate implements Service {
  private readonly payload: ClickPropertyTrackBody;
  private readonly boneRepository: Repository;
  private readonly propertyRepository: Repository;

  constructor(state: TrackListState, payload: ClickPropertyTrackBody, boneRepository: Repository, propertyRepository: Repository) {
    super(state);
    this.payload = payload;
    this.boneRepository = boneRepository;
    this.propertyRepository = propertyRepository;
  }

  private selectAllClick = () => {
    const { state, payload } = this;
    const { clickSelectAll, clickUnselectAll } = new AllClick();
    return payload.eventType === 'selectAll' ? clickSelectAll({ state, payload }) : clickUnselectAll({ state, payload });
  };

  private selectRightClick = () => {
    const { state, payload } = this;
    const { clickRightNotSelectedTrack, clickRightSelectedTrack } = new RightClick();
    const isSelectedTrack = state.selectedProperties.includes(payload.trackNumber);
    return isSelectedTrack ? clickRightSelectedTrack({ state }) : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new MultipleClick();
    const isSelectedTrack = this.state.selectedProperties.includes(this.payload.trackNumber);
    return isSelectedTrack ? multipleClick.clickMultipleSelectedTrack({ state, payload }) : multipleClick.clickMultipleNotSelectedTrack({ state, payload });
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

export default PropertyTrackService;
