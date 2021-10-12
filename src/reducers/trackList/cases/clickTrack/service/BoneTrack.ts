import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

import { Service } from './index';
import { BoneTrackLeftClick } from './LeftClick';
import { BoneTrackMultipleClick } from './MultipleClick';
import { BoneTrackRightClick } from './RightClick';
import { BoneTrackAllClick } from './AllClick';
import { Repository } from '../repository';

class BoneTrackService implements Service {
  private readonly state: TrackListState;
  private readonly payload: ClickBoneTrackBody;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickBoneTrackBody, repository: Repository) {
    this.state = state;
    this.payload = payload;
    this.repository = repository;
  }

  private selectAllClick = () => {
    const { state } = this;
    const { isSelectedAll } = this.payload;
    const { clickSelectAll, clickUnselectAll } = new BoneTrackAllClick();
    return isSelectedAll ? clickSelectAll({ state }) : clickUnselectAll();
  };

  private selectRightClick = () => {
    const { state, payload } = this;
    const { clickRightNotSelectedTrack, clickRightSelectedTrack } = new BoneTrackRightClick();
    const isSelectedTrack = state.selectedBones.includes(payload.boneIndex);
    return isSelectedTrack
      ? clickRightSelectedTrack({ state })
      : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new BoneTrackMultipleClick();
    const isSelectedTrack = this.state.selectedBones.includes(this.payload.boneIndex);
    return isSelectedTrack
      ? multipleClick.clickMultipleSelectedTrack({ state, payload })
      : multipleClick.clickMultipleNotSelectedTrack({ state, payload });
  };

  private selectLeftClick = () => {
    const { payload } = this;
    const { clickLeft } = new BoneTrackLeftClick();
    return clickLeft({ payload });
  };

  public selectClickType = () => {
    const { isRightClicked, isShowedContextMenu, isMultipleClicked } = this.payload;
    if (isRightClicked && isShowedContextMenu) {
      return this.selectAllClick();
    }
    if (isRightClicked && !isShowedContextMenu) {
      return this.selectRightClick();
    }
    if (!isRightClicked && isMultipleClicked) {
      return this.selectMultipleClick();
    }
    return this.selectLeftClick();
  };

  public updateState = (selectedTracks: SelectedBones & SelectedTransforms) => {
    const { updateTrackListState, updateTrackList } = this.repository;
    const interpolationType = this.repository.updateInterpolationType!(selectedTracks);
    const trackList = updateTrackList(selectedTracks);
    return updateTrackListState({ ...trackList, ...interpolationType, ...selectedTracks });
  };
}

export default BoneTrackService;
