import { PropertyIdentifier, TrackIdentifier } from 'types/TP';
import { SelectedKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';

interface Parmas {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class PropertyKeyframeLeftClick implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = <T extends TrackIdentifier>(
    editorTrackList: TimeEditorTrack<T>[],
    trackNumber: number,
  ) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedTransforms = ({ state, payload }: Parmas) => {
    const { time, trackNumber, trackType } = payload;
    const { property } = this.findEditorTrack(state.propertyTrackList, trackNumber);
    const selectedKeyframes: SelectedKeyframe<PropertyIdentifier> = {
      time,
      trackNumber,
      trackType,
      property,
    };
    return this.clusterKeyframes.initializeClusterKeyframes([selectedKeyframes]);
  };

  public selectByLeftClick = (params: Parmas): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: [],
      selectedPropertyKeyframes: this.getSelectedTransforms(params),
    };
  };
}

export default PropertyKeyframeLeftClick;
