import produce from 'immer';

import { ClusteredKeyframe, SelectedKeyframe } from 'types/TP/keyframe';
import { getBinarySearch, findElementIndex } from 'utils/TP';

class ClusterKeyframes {
  private checkIncludedTime = <K>(keyframes: K[], time: number, key: keyof K) => {
    const included = getBinarySearch({ collection: keyframes, index: time, key });
    return included === -1;
  };

  initializeClusterKeyframes = (selectedKeyframes: SelectedKeyframe[]) => {
    const clusteredKeyframes: ClusteredKeyframe[] = [];
    selectedKeyframes.forEach((selectedKeyframe) => {
      const { time, value, trackNumber, ...rest } = selectedKeyframe;
      const trackIndex = findElementIndex(clusteredKeyframes, trackNumber, 'trackNumber');
      if (trackIndex === -1) {
        clusteredKeyframes.push({ trackNumber, keyframes: [{ time, value }], ...rest });
      } else {
        clusteredKeyframes[trackIndex].keyframes.push({ time, value });
      }
    });
    return clusteredKeyframes;
  };

  addKeyframeTimes = (oldValues: ClusteredKeyframe[], selectedKeyframes: SelectedKeyframe[]) => {
    const clusteredKeyframes = this.initializeClusterKeyframes(selectedKeyframes);
    return produce(oldValues, (draft) => {
      clusteredKeyframes.forEach((track) => {
        const { keyframes, trackNumber, ...rest } = track;
        const trackIndex = findElementIndex(draft, track.trackNumber, 'trackNumber');
        if (trackIndex === -1) {
          draft.push({ keyframes, trackNumber, ...rest });
          draft.sort((a, b) => a.trackNumber - b.trackNumber);
        } else {
          draft[trackIndex].keyframes.push(...keyframes);
          draft[trackIndex].keyframes.sort((a, b) => a.time - b.time);
        }
      });
    });
  };

  filterKeyframeTimes = (oldValues: ClusteredKeyframe[], selectedKeyframes: SelectedKeyframe[]) => {
    const clusteredKeyframes = this.initializeClusterKeyframes(selectedKeyframes);
    return produce(oldValues, (draft) => {
      clusteredKeyframes.forEach((track) => {
        const { keyframes, trackNumber } = track;
        const trackIndex = findElementIndex(draft, trackNumber, 'trackNumber');
        if (trackIndex !== -1) {
          const filteredTimes = draft[trackIndex].keyframes.filter((keyframe) => {
            return this.checkIncludedTime(keyframes, keyframe.time, 'time');
          });
          draft[trackIndex].keyframes = filteredTimes;
        }
      });
    });
  };
}

export default ClusterKeyframes;
