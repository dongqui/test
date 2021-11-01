import { TrackIdentifier, BoneIdentifier, PropertyIdentifier } from 'types/TP';
import { TimeEditorTrack, SelectedKeyframe } from 'types/TP/keyframe';
import { SelectKeyframes } from 'actions/keyframes';
import { KeyframesState } from 'reducers/keyframes';
import { AllSelectedKeyframes } from 'reducers/keyframes/types';
import { ClusterKeyframes } from 'reducers/keyframes/classes';
import { findElementIndex } from 'utils/TP';

import { LeftClick } from './index';

interface Params {
  state: KeyframesState;
  payload: SelectKeyframes;
}

class BoneKeyframeLeftClick extends ClusterKeyframes implements LeftClick {
  private readonly clusterKeyframes = new ClusterKeyframes();

  private findEditorTrack = <T extends TrackIdentifier>(
    editorTrackList: TimeEditorTrack<T>[],
    trackNumber: number,
  ) => {
    const trackIndex = findElementIndex(editorTrackList, trackNumber, 'trackNumber');
    return editorTrackList[trackIndex];
  };

  private getSelectedBones = ({ state, payload }: Params) => {
    const { targetId } = this.findEditorTrack(state.boneTrackList, payload.trackNumber);
    const selectedBones: SelectedKeyframe<BoneIdentifier>[] = [{ ...payload, targetId }];
    return this.clusterKeyframes.initializeClusterKeyframes(selectedBones);
  };

  private getSelectedProperties = ({ state, payload }: Params) => {
    const { trackNumber, time } = payload;
    const selectedProperties: SelectedKeyframe<PropertyIdentifier>[] = [];
    for (let transform = trackNumber + 1; transform <= trackNumber + 3; transform++) {
      const { property } = this.findEditorTrack(state.propertyTrackList, transform);
      selectedProperties.push({ trackNumber: transform, property, time, trackType: 'property' });
    }
    return this.clusterKeyframes.initializeClusterKeyframes(selectedProperties);
  };

  selectByLeftClick = (params: Params): AllSelectedKeyframes => {
    return {
      selectedLayerKeyframes: [],
      selectedBoneKeyframes: this.getSelectedBones(params),
      selectedPropertyKeyframes: this.getSelectedProperties(params),
    };
  };
}

export default BoneKeyframeLeftClick;
