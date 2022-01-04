import { SelectedKeyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { HorizontalSelection } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class TransformKeyframeHorizontal implements HorizontalSelection {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findPropertyTrack = ({ state, payload }: Params) => {
    const { propertyTrackList } = state;
    const { trackNumber } = payload;
    const trackIndex = findElementIndex(propertyTrackList, trackNumber, 'trackNumber');
    return propertyTrackList[trackIndex];
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const selectedTransforms: SelectedKeyframe[] = [];
    const { trackNumber, keyframes, trackId } = this.findPropertyTrack({ state, payload });
    keyframes.forEach((keyframe) => {
      const { time, value, isDeleted } = keyframe;
      if (!isDeleted) {
        selectedTransforms.push({ trackNumber, time, value, trackId, trackType: 'property' });
      }
    });
    return this.clusterKeyframes.initializeClusterKeyframes(selectedTransforms);
  };

  public selectByHorizontal = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedPropertyKeyframes: this.getSelectedProperties(params),
    };
  };
}

export default TransformKeyframeHorizontal;
