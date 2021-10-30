import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick, SelectedTracks } from './index';

class BoneTrackRightClick implements RightClick {
  private setSelectedTracks = (boneNumber: number): SelectedTracks => {
    const selectedProperties: number[] = [];
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedProperties.push(transform);
    }
    return { selectedBones: [boneNumber], selectedProperties };
  };

  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  public clickRightSelectedTrack = ({ state }: { state: TrackListState }): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    return { selectedBones, selectedProperties };
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  public clickRightNotSelectedTrack = (params: { payload: ClickBoneTrackBody }): SelectedTracks => {
    const { payload } = params;
    const { selectedBones, selectedProperties } = this.setSelectedTracks(payload.trackNumber);
    return { selectedBones, selectedProperties };
  };
}

export default BoneTrackRightClick;
