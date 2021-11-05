import produce from 'immer';

import { BoneTrack } from 'types/TP/track';
import { TrackListState } from 'reducers/trackList';
import { getBinarySearch } from 'utils/TP';

import { Repository } from './index';

class BoneTrackRepository implements Repository {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  private findTrackIndex = (trackNumber: number) => {
    const { boneTrackList } = this.state;
    const trackIndex = getBinarySearch<BoneTrack>({
      collection: boneTrackList,
      index: trackNumber,
      key: 'trackNumber',
    });
    return trackIndex;
  };

  public updateIsSelected = (selectedTrackList: number[]): BoneTrack[] => {
    const { boneTrackList, selectedBones } = this.state;
    return produce(boneTrackList, (draft) => {
      selectedBones.forEach((trackNumber) => {
        const trackIndex = this.findTrackIndex(trackNumber);
        draft[trackIndex].isSelected = false;
      });
      selectedTrackList.forEach((trackNumber) => {
        const trackIndex = this.findTrackIndex(trackNumber);
        draft[trackIndex].isSelected = true;
      });
    });
  };

  // // transform index 배열 기준으로 interpolation type값 설정
  // public updateInterpolationType = ({ selectedTransforms }: SelectedTransforms) => {
  //   const set = new Set<InterpolationType>();
  //   const { transformTrackList } = this.state;
  //   selectedTransforms.forEach((index) => {
  //     const trackIndex = getBinarySearch<TransformTrack>({
  //       collection: transformTrackList,
  //       index,
  //       key: 'transformIndex',
  //     });
  //     const type = transformTrackList[trackIndex].interpolationType;
  //     set.add(type);
  //   });
  //   return { interpolationType: set.size === 1 ? [...set][0] : 'none' };
  // };
}

export default BoneTrackRepository;
