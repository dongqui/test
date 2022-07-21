import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { PropertyTrack } from 'types/TP/track';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';
import { RightClick, SelectedTracks } from './index';

class BoneTrackRightClick implements RightClick {
  private setSelectedTracks = (boneNumber: number, propertyTrackList: PropertyTrack[]): SelectedTracks => {
    const childTracks = findChildrenTracks(boneNumber, propertyTrackList);
    const selectedProperties: number[] = [];
    for (const child of childTracks) {
      selectedProperties.push(child.trackNumber);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };

  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  public clickRightSelectedTrack = ({ state }: { state: TrackListState }): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    return { selectedBones, selectedProperties };
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  public clickRightNotSelectedTrack = (params: { payload: ClickBoneTrackBody; state: TrackListState }): SelectedTracks => {
    const { payload, state } = params;
    const { selectedBones, selectedProperties } = this.setSelectedTracks(payload.trackNumber, state.propertyTrackList);
    return { selectedBones, selectedProperties };
  };
}

export default BoneTrackRightClick;
