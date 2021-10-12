import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick } from './index';

class RightClickTransformTrack implements RightClick {
  private setSelectedTracks = (selectedBones: number[], selectedTransforms: number[]) => {
    return { selectedBones, selectedTransforms };
  };

  private selectBoneTransforms = (payload: ClickTransformTrackBody) => {
    return this.setSelectedTracks([], [payload.transformIndex]);
  };

  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  public clickRightSelectedTrack = ({ state }: { state: TrackListState }) => {
    const { selectedBones, selectedTransforms } = state;
    return this.setSelectedTracks(selectedBones, selectedTransforms);
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  public clickRightNotSelectedTrack = ({ payload }: { payload: ClickTransformTrackBody }) => {
    return this.selectBoneTransforms(payload);
  };
}

export default RightClickTransformTrack;
