import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick, SelectedTracks } from './index';

class BoneTrackRightClick implements RightClick {
  private setSelectedTracks = (boneNumber: number): SelectedTracks => {
    const selectedTransforms: number[] = [];
    for (let transform = boneNumber + 1; transform <= boneNumber + 3; transform++) {
      selectedTransforms.push(transform);
    }
    return { selectedBones: [boneNumber], selectedTransforms };
  };

  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  public clickRightSelectedTrack = ({ state }: { state: TrackListState }): SelectedTracks => {
    const { selectedBones, selectedTransforms } = state;
    return { selectedBones, selectedTransforms };
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  public clickRightNotSelectedTrack = (params: { payload: ClickBoneTrackBody }): SelectedTracks => {
    const { payload } = params;
    const { selectedBones, selectedTransforms } = this.setSelectedTracks(payload.trackNumber);
    return { selectedBones, selectedTransforms };
  };
}

export default BoneTrackRightClick;
