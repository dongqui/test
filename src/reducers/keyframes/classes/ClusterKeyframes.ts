import produce from 'immer';

import { ClusteredKeyframe, SelectedKeyframe } from 'types/TP/keyframe';
import { getBinarySearch, findElementIndex } from 'utils/TP';

class ClusterKeyframes {
  private checkIncludedTime = (times: number[], time: number) => {
    const included = getBinarySearch({ collection: times, index: time });
    return included === -1;
  };

  initializeClusterKeyframes = (selectedKeyframes: SelectedKeyframe[]) => {
    const clusteredKeyframes: ClusteredKeyframe[] = [];
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

  addKeyframeTimes = (oldValues: ClusteredKeyframe[], selectedKeyframes: SelectedKeyframe[]) => {
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

  filterKeyframeTimes = (oldValues: ClusteredKeyframe[], selectedKeyframes: SelectedKeyframe[]) => {
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
