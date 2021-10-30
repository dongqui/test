import { ClickPropertyTrackBody } from 'actions/trackList';
import { TrackListState } from 'reducers/trackList';
import { RightClick, SelectedTracks } from './index';

class PropertyTrackRightClick implements RightClick {
  // 선택 효과가 적용 된 트랙을 마우스 우클릭
  clickRightSelectedTrack = ({ state }: { state: TrackListState }): SelectedTracks => {
    const { selectedBones, selectedProperties } = state;
    return { selectedBones, selectedProperties };
  };

  // 선택 효과가 적용되지 않은 트랙을 마우스 우클릭
  clickRightNotSelectedTrack = (params: { payload: ClickPropertyTrackBody }): SelectedTracks => {
    const { payload } = params;
    return { selectedBones: [], selectedProperties: [payload.trackNumber] };
  };
}

export default PropertyTrackRightClick;
