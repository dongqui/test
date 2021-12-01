import { SelectKeyframesByDragBox } from 'actions/keyframes';
import { ClusteredKeyframe } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { DragBox } from './index';

class KeyframeDragBox implements DragBox {
  private readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  private classifyAllKeyframes = (keyframes: SelectKeyframesByDragBox[]) => {
    const { boneTrackList, propertyTrackList } = this.state;
    const layerKeyframeMap = new Map<number, Set<number>>();
    const boneKeyframeMap = new Map<number, Set<number>>();
    const propertyKeyframeMap = new Map<number, Set<number>>();

    keyframes.forEach((keyframe) => {
      const { time, trackNumber } = keyframe;
      const selectedKeyframes = trackNumber === -1 ? layerKeyframeMap : trackNumber % 10 === 0 ? boneKeyframeMap : propertyKeyframeMap;
      const currentValue = selectedKeyframes.get(trackNumber);
      if (currentValue) {
        currentValue.add(time);
      } else {
        selectedKeyframes.set(trackNumber, new Set([time]));
      }
    });

    if (layerKeyframeMap.size) {
      layerKeyframeMap.forEach((selectedLayerKeyframe) => {
        boneTrackList.forEach((boneTrack) => {
          const currentValue = boneKeyframeMap.get(boneTrack.trackNumber);
          if (!currentValue) boneKeyframeMap.set(boneTrack.trackNumber, new Set());
          selectedLayerKeyframe.forEach((layerKeyframe) => {
            boneKeyframeMap.get(boneTrack.trackNumber)?.add(layerKeyframe);
          });
        });
      });
      layerKeyframeMap.forEach((selectedLayerKeyframes) => {
        propertyTrackList.forEach((propertyTrack) => {
          const currentValue = propertyKeyframeMap.get(propertyTrack.trackNumber);
          if (!currentValue) propertyKeyframeMap.set(propertyTrack.trackNumber, new Set());
          selectedLayerKeyframes.forEach((layerKeyframe) => {
            boneKeyframeMap.get(propertyTrack.trackNumber)?.add(layerKeyframe);
          });
        });
      });
    }

    if (boneKeyframeMap.size) {
      boneKeyframeMap.forEach((selectedBoneKeyframes, boneNumber) => {
        for (let propertyNumber = boneNumber + 1; propertyNumber <= boneNumber + 3; propertyNumber++) {
          const currentValue = propertyKeyframeMap.get(propertyNumber);
          if (!currentValue) propertyKeyframeMap.set(propertyNumber, new Set());
          selectedBoneKeyframes.forEach((boneKeyframe) => {
            propertyKeyframeMap.get(propertyNumber)?.add(boneKeyframe);
          });
        }
      });
    }

    return [layerKeyframeMap, boneKeyframeMap, propertyKeyframeMap];
  };

  private selectLayerKeyframes = (layerKeyframeMap: Map<number, Set<number>>): ClusteredKeyframe[] => {
    if (!layerKeyframeMap.size) return [];
    const { layerTrack } = this.state;
    const selectedLayerKeyframes: ClusteredKeyframe[] = [];
    layerKeyframeMap.forEach((selectedKeyframes) => {
      selectedLayerKeyframes.push({ trackId: layerTrack.trackId, trackNumber: -1, trackType: 'layer', keyframes: [...selectedKeyframes].map((time) => ({ time })) });
    });
    return selectedLayerKeyframes;
  };

  private selectBoneKeyframes = (boneKeyframeMap: Map<number, Set<number>>): ClusteredKeyframe[] => {
    if (!boneKeyframeMap.size) return [];
    const { boneTrackList } = this.state;
    const selectedBoneKeyframes: ClusteredKeyframe[] = [];
    boneKeyframeMap.forEach((selectedKeyframes, boneNumber) => {
      const trackIndex = findElementIndex(boneTrackList, boneNumber, 'trackNumber');
      const { trackId } = boneTrackList[trackIndex];
      selectedBoneKeyframes.push({ trackId, trackNumber: boneNumber, trackType: 'bone', keyframes: [...selectedKeyframes].map((time) => ({ time })) });
    });
    return selectedBoneKeyframes;
  };

  private selectPropertyKeyframes = (propertyKeyframeMap: Map<number, Set<number>>): ClusteredKeyframe[] => {
    if (!propertyKeyframeMap.size) return [];
    const { propertyTrackList } = this.state;
    const selectedPropertyKeyframes: ClusteredKeyframe[] = [];
    propertyKeyframeMap.forEach((selectedKeyframes, propertyNumber) => {
      const trackIndex = findElementIndex(propertyTrackList, propertyNumber, 'trackNumber');
      const { trackId } = propertyTrackList[trackIndex];
      const keyframes = [...selectedKeyframes].map((time) => {
        const keyframeIndex = findElementIndex(propertyTrackList[trackIndex].keyframes, time, 'time');
        const { value } = propertyTrackList[trackIndex].keyframes[keyframeIndex];
        return { time, value };
      });
      selectedPropertyKeyframes.push({ trackId, trackNumber: propertyNumber, trackType: 'property', keyframes });
    });
    return selectedPropertyKeyframes;
  };

  selectKeyframeByDragBox = (payload: SelectKeyframesByDragBox[]): Partial<KeyframesState> => {
    const [layerKeyframeMap, boneKeyframeMap, propertyKeyframeMap] = this.classifyAllKeyframes(payload);
    return {
      selectedLayerKeyframes: this.selectLayerKeyframes(layerKeyframeMap),
      selectedBoneKeyframes: this.selectBoneKeyframes(boneKeyframeMap),
      selectedPropertyKeyframes: this.selectPropertyKeyframes(propertyKeyframeMap),
    };
  };
}

export default KeyframeDragBox;
