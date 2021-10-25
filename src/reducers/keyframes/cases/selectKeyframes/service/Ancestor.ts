import produce from 'immer';

import { ClusteredTimes, SelectedKeyframe, TrackKeyframes } from 'types/TP_New/keyframe';
import { getBinarySearch } from 'utils/TP';

export class ClusterKeyframes {
  protected findTrackIndex = (
    clusteredTimes: ClusteredTimes[] | TrackKeyframes[],
    trackIndex: number | string,
  ) => {
    if (typeof trackIndex === 'number') {
      const index = getBinarySearch<ClusteredTimes | TrackKeyframes>({
        collection: clusteredTimes,
        index: trackIndex,
        key: 'trackIndex',
      });
      return index;
    } else {
      const index = clusteredTimes.findIndex((value) => value.trackIndex === trackIndex);
      return index;
    }
  };

  private checkIncludedTime = (collection: number[], index: number) => {
    const included = getBinarySearch({ collection, index });
    return included === -1;
  };

  protected initializeClusteredTimes = (selectedKeyframes: SelectedKeyframe[]) => {
    const clusteredTimes: ClusteredTimes[] = [];
    selectedKeyframes.forEach((keyframe) => {
      const { timeIndex, trackIndex } = keyframe;
      const index = this.findTrackIndex(clusteredTimes, trackIndex);
      if (index === -1) {
        clusteredTimes.push({
          trackIndex: trackIndex,
          times: [timeIndex],
        });
      } else {
        clusteredTimes[index].times.push(timeIndex);
      }
    });
    return clusteredTimes;
  };

  protected addTimes = (clustered: ClusteredTimes[], selected: SelectedKeyframe[]) => {
    const converted = this.initializeClusteredTimes(selected);
    return produce(clustered, (draft) => {
      converted.forEach((track) => {
        const trackIndex = this.findTrackIndex(clustered, track.trackIndex);
        if (trackIndex !== -1) {
          const times = draft[trackIndex].times;
          draft[trackIndex].times = [...times, ...track.times].sort((a, b) => a - b);
        } else {
          draft.push({ times: track.times, trackIndex: track.trackIndex });
          draft.sort((a, b) => (a.trackIndex as number) - (b.trackIndex as number));
        }
      });
    });
  };

  protected filterTimes = (clustered: ClusteredTimes[], selected: SelectedKeyframe[]) => {
    const converted = this.initializeClusteredTimes(selected);
    return produce(clustered, (draft) => {
      converted.forEach((track) => {
        const trackIndex = this.findTrackIndex(clustered, track.trackIndex);
        if (trackIndex !== -1) {
          const filtered = draft[trackIndex].times.filter((time) =>
            this.checkIncludedTime(track.times, time),
          );
          draft[trackIndex].times = filtered;
        }
      });
    });
  };
}
