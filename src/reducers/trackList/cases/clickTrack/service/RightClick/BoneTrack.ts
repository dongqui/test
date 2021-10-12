import { ClickBoneTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick } from './index';

class BoneTrackRightClick implements RightClick {
  private setSelectedTracks = (selectedBones: number[], selectedTransforms: number[]) => {
    return { selectedBones, selectedTransforms };
  };

  private selectBoneTransforms = (payload: ClickBoneTrackBody) => {
    const selectedTransforms: number[] = [];
    const boneIndex = payload.boneIndex;
    for (let index = boneIndex + 1; index <= boneIndex + 9; index++) {
      selectedTransforms.push(index);
    }
    return this.setSelectedTracks([boneIndex], selectedTransforms);
  };

  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  public clickRightSelectedTrack = ({ state }: { state: TrackListState }) => {
    const { selectedBones, selectedTransforms } = state;
    return this.setSelectedTracks(selectedBones, selectedTransforms);
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  public clickRightNotSelectedTrack = ({ payload }: { payload: ClickBoneTrackBody }) => {
    const { selectedBones, selectedTransforms } = this.selectBoneTransforms(payload);
    return this.setSelectedTracks(selectedBones, selectedTransforms);
  };
}

export default BoneTrackRightClick;
