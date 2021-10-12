import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';

import { Service } from './index';
import { TransformTrackLeftClick } from './LeftClick';
import { TransformTrackMultipleClick } from './MultipleClick';
import { TransformTrackRightClick } from './RightClick';
import { TransformTrackAllClick } from './AllClick';
import { Repository } from '../repository';

class TransformTrackService implements Service {
  private readonly state: TrackListState;
  private readonly payload: ClickTransformTrackBody;
  private readonly repository: Repository;

  constructor(state: TrackListState, payload: ClickTransformTrackBody, repository: Repository) {
    this.state = state;
    this.payload = payload;
    this.repository = repository;
  }

  private selectAllClick = () => {
    const { state, payload } = this;
    const { isSelectedAll } = payload;
    const { clickSelectAll, clickUnselectAll } = new TransformTrackAllClick();
    return isSelectedAll
      ? clickSelectAll({ state, payload })
      : clickUnselectAll({ state, payload });
  };

  private selectRightClick = () => {
    const { state, payload } = this;
    const { clickRightNotSelectedTrack, clickRightSelectedTrack } = new TransformTrackRightClick();
    const isSelectedTrack = state.selectedTransforms.includes(payload.transformIndex);
    return isSelectedTrack
      ? clickRightSelectedTrack({ state })
      : clickRightNotSelectedTrack({ payload });
  };

  private selectMultipleClick = () => {
    const { state, payload } = this;
    const multipleClick = new TransformTrackMultipleClick();
    const isSelectedTrack = this.state.selectedTransforms.includes(this.payload.transformIndex);
    return isSelectedTrack
      ? multipleClick.clickMultipleSelectedTrack({ state, payload })
      : multipleClick.clickMultipleNotSelectedTrack({ state, payload });
  };

  private selectLeftClick = () => {
    const { payload } = this;
    const { clickLeft } = new TransformTrackLeftClick();
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
    const { updateTrackListState, updateTrackList, updateInterpolationType } = this.repository;
    const interpolationType = updateInterpolationType!(selectedTracks);
    const trackList = updateTrackList(selectedTracks);
    return updateTrackListState({ ...trackList, ...interpolationType, ...selectedTracks });
  };
}

export default TransformTrackService;
