import { ClickTransformTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick, SelectedTracks } from './index';

class TransformTrackRightClick implements RightClick {
  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  clickRightSelectedTrack = ({ state }: { state: TrackListState }): SelectedTracks => {
    const { selectedBones, selectedTransforms } = state;
    return { selectedBones, selectedTransforms };
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  clickRightNotSelectedTrack = (params: { payload: ClickTransformTrackBody }): SelectedTracks => {
    const { payload } = params;
    return { selectedBones: [], selectedTransforms: [payload.trackNumber] };
  };
}

export default TransformTrackRightClick;
