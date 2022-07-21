import { SelectKeyframesByDragBox } from 'actions/keyframes';
import { ClusteredKeyframe, TimeEditorTrack } from 'types/TP/keyframe';
import { KeyframesState } from 'reducers/keyframes';
import { findElementIndex } from 'utils/TP';

import { DragBox } from './index';
import { findChildrenTracks } from 'utils/TP/findChildrenTracks';

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
      const isBoneTrack = !!boneTrackList.find((boneTrack) => boneTrack.trackNumber === trackNumber);
      const selectedKeyframes = trackNumber === -1 ? layerKeyframeMap : isBoneTrack ? boneKeyframeMap : propertyKeyframeMap;
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
          selectedLayerKeyframe.forEach((layerFrame) => {
            const boneKeyframeIndex = findElementIndex(boneTrack.keyframes, layerFrame, 'time');
            if (boneKeyframeIndex !== -1 && !boneTrack.keyframes[boneKeyframeIndex].isDeleted) {
              propertyKeyframeMap.get(boneTrack.trackNumber)?.add(layerFrame);
            }
          });
        });
      });
      layerKeyframeMap.forEach((selectedLayerKeyframes) => {
        propertyTrackList.forEach((propertyTrack) => {
          const currentValue = propertyKeyframeMap.get(propertyTrack.trackNumber);
          if (!currentValue) propertyKeyframeMap.set(propertyTrack.trackNumber, new Set());
          selectedLayerKeyframes.forEach((layerFrame) => {
            const propertyKeyframeIndex = findElementIndex(propertyTrack.keyframes, layerFrame, 'time');
            if (propertyKeyframeIndex !== -1 && !propertyTrack.keyframes[propertyKeyframeIndex].isDeleted) {
              propertyKeyframeMap.get(propertyTrack.trackNumber)?.add(layerFrame);
            }
          });
        });
      });
    }

    if (boneKeyframeMap.size) {
      boneKeyframeMap.forEach((selectedBoneKeyframes, boneNumber) => {
        const childTracks = findChildrenTracks(boneNumber, propertyTrackList);
        for (const propertyTrack of childTracks) {
          const propertyNumber = propertyTrack.trackNumber;
          const currentValue = propertyKeyframeMap.get(propertyNumber);
          if (!currentValue) propertyKeyframeMap.set(propertyNumber, new Set());
          selectedBoneKeyframes.forEach((boneFrame) => {
            const propertyKeyframeIndex = findElementIndex(propertyTrack.keyframes, boneFrame, 'time');
            if (propertyKeyframeIndex !== -1 && !propertyTrack.keyframes[propertyKeyframeIndex].isDeleted) {
              propertyKeyframeMap.get(propertyNumber)?.add(boneFrame);
            }
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
      selectedLayerKeyframes.push({
        trackId: layerTrack.trackId,
        parentTrackNumber: -1,
        trackNumber: -1,
        trackType: 'layer',
        keyframes: [...selectedKeyframes].map((time) => ({ time })),
      });
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
      selectedBoneKeyframes.push({ trackId, trackNumber: boneNumber, parentTrackNumber: -1, trackType: 'bone', keyframes: [...selectedKeyframes].map((time) => ({ time })) });
    });
    return selectedBoneKeyframes;
  };

  private selectPropertyKeyframes = (propertyKeyframeMap: Map<number, Set<number>>): ClusteredKeyframe[] => {
    if (!propertyKeyframeMap.size) return [];
    const { propertyTrackList } = this.state;
    const selectedPropertyKeyframes: ClusteredKeyframe[] = [];
    propertyKeyframeMap.forEach((selectedKeyframes, propertyNumber) => {
      const trackIndex = findElementIndex(propertyTrackList, propertyNumber, 'trackNumber');
      const { trackId, parentTrackNumber } = propertyTrackList[trackIndex];
      const keyframes = [...selectedKeyframes].map((time) => {
        const keyframeIndex = findElementIndex(propertyTrackList[trackIndex].keyframes, time, 'time');
        const { value } = propertyTrackList[trackIndex].keyframes[keyframeIndex];
        return { time, value };
      });
      selectedPropertyKeyframes.push({ trackId, trackNumber: propertyNumber, trackType: 'property', keyframes, parentTrackNumber });
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
