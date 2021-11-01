import produce from 'immer';

import { TrackIdentifier } from 'types/TP_New';
import { ClusteredKeyframe, SelectedKeyframe } from 'types/TP_New/keyframe';
import { getBinarySearch, findElementIndex } from 'utils/TP';

class ClusterKeyframes {
  private checkIncludedTime = (times: number[], time: number) => {
    const included = getBinarySearch({ collection: times, index: time });
    return included === -1;
  };

  initializeClusterKeyframes = <T extends TrackIdentifier>(
    selectedKeyframes: SelectedKeyframe<T>[],
  ) => {
    const clusteredKeyframes: ClusteredKeyframe<T>[] = [];
    selectedKeyframes.forEach((selectedKeyframe) => {
      const { time, trackNumber, ...rest } = selectedKeyframe;
      const trackIndex = findElementIndex(clusteredKeyframes, trackNumber, 'trackNumber');
      if (trackIndex === -1) {
        clusteredKeyframes.push({ trackNumber, times: [time], ...(rest as any) });
      } else {
        clusteredKeyframes[trackIndex].times.push(time);
      }
    });
    return clusteredKeyframes;
  };

  addKeyframeTimes = <T extends TrackIdentifier>(
    oldValues: ClusteredKeyframe<T>[],
    selectedKeyframes: SelectedKeyframe<T>[],
  ) => {
    const clusteredKeyframes = this.initializeClusterKeyframes(selectedKeyframes);
    return produce(oldValues, (draft) => {
      clusteredKeyframes.forEach((track) => {
        const { times, trackNumber, ...rest } = track;
        const trackIndex = findElementIndex(oldValues, track.trackNumber, 'trackNumber');
        if (trackIndex !== -1) {
          draft[trackIndex].times = [...draft[trackIndex].times, ...track.times];
          draft[trackIndex].times.sort((a, b) => a - b);
        } else {
          draft.push({ times, trackNumber, ...(rest as any) });
          draft.sort((a, b) => a.trackNumber - b.trackNumber);
        }
      });
    });
  };

  filterKeyframeTimes = <T extends TrackIdentifier>(
    oldValues: ClusteredKeyframe<T>[],
    selectedKeyframes: SelectedKeyframe<T>[],
  ) => {
    const clusteredKeyframes = this.initializeClusterKeyframes(selectedKeyframes);
    return produce(oldValues, (draft) => {
      clusteredKeyframes.forEach((track) => {
        const { times, trackNumber } = track;
        const trackIndex = findElementIndex(oldValues, trackNumber, 'trackNumber');
        if (trackIndex !== -1) {
          const filteredTimes = draft[trackIndex].times.filter((time) => {
            return this.checkIncludedTime(times, time);
          });
          draft[trackIndex].times = filteredTimes;
        }
      });
    });
  };
}

export default ClusterKeyframes;
