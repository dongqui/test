import produce from 'immer';

import { BoneTrack, InterpolationType, TransformTrack } from 'types/TP_New/track';
import { TrackListState } from 'reducers/trackList';
import { SelectedBones, SelectedTransforms } from 'reducers/trackList/types';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

class BoneTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  // bone track list 업데이트
  private updateBoneTrackList = (next: SelectedBones) => {
    const { boneTrackList, selectedBones } = this.state;
    return produce(boneTrackList, (draft) => {
      selectedBones.forEach((index) => {
        const trackIndex = getBinarySearch<BoneTrack>({
          collection: boneTrackList,
          index,
          key: 'boneIndex',
        });
        draft[trackIndex].isSelected = false;
      });
      next.selectedBones.forEach((index) => {
        const trackIndex = getBinarySearch<BoneTrack>({
          collection: boneTrackList,
          index,
          key: 'boneIndex',
        });
        draft[trackIndex].isSelected = true;
      });
    });
  };

  // transform track list 업데이트
  private updateTransformTrackList = (next: SelectedTransforms) => {
    const { transformTrackList, selectedTransforms } = this.state;
    return produce(transformTrackList, (draft) => {
      selectedTransforms.forEach((index) => {
        const trackIndex = getBinarySearch<TransformTrack>({
          collection: transformTrackList,
          index,
          key: 'transformIndex',
        });
        draft[trackIndex].isSelected = false;
      });
      next.selectedTransforms.forEach((index) => {
        const trackIndex = getBinarySearch<TransformTrack>({
          collection: transformTrackList,
          index,
          key: 'transformIndex',
        });
        draft[trackIndex].isSelected = true;
      });
    });
  };

  // track list 업데이트. 매개변수에 따라 bone track, transform track 업데이트
  public updateTrackList = (tracks: SelectedBones & SelectedTransforms) => {
    return {
      boneTrackList: this.updateBoneTrackList(tracks),
      transformTrackList: this.updateTransformTrackList(tracks),
    };
  };

  // transform index 배열 기준으로 interpolation type값 설정
  public updateInterpolationType = ({ selectedTransforms }: SelectedTransforms) => {
    const set = new Set<InterpolationType>();
    const { transformTrackList } = this.state;
    selectedTransforms.forEach((index) => {
      const trackIndex = getBinarySearch<TransformTrack>({
        collection: transformTrackList,
        index,
        key: 'transformIndex',
      });
      const type = transformTrackList[trackIndex].interpolationType;
      set.add(type);
    });
    return { interpolationType: set.size === 1 ? [...set][0] : 'none' };
  };

  public updateTrackListState = (params: Partial<TrackListState>) => {
    return Object.assign({}, this.state, params);
  };
}

export default BoneTrackRepository;
