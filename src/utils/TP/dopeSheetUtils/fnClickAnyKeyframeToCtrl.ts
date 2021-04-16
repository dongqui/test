import _ from 'lodash';
import produce from 'immer';
import { TPDopeSheet, TPLastBone, KeyframeData } from 'types/TP';
import { TP_TRACK_INDEX } from 'utils/const';
import { fnClickBoneKeyframe, fnClickLayerKeyframe } from './index';
interface FnClickAnyKeyframeToCtrl {
  deleteTargetKeyframes: KeyframeData[];
  dopeSheetList: TPDopeSheet[];
  lastBoneList: TPLastBone[];
  layerKey: string;
  time: number;
  trackName: string;
  trackIndex: number;
  isLocked: boolean;
}

const fnClickAnyKeyframeToCtrl = ({
  deleteTargetKeyframes,
  dopeSheetList,
  lastBoneList,
  layerKey,
  time,
  trackIndex,
  trackName,
  isLocked,
}: FnClickAnyKeyframeToCtrl) => {
  const clickedKeyframes: KeyframeData[] = [];
  const remainder = trackIndex % 10;
  const {
    LAYER,
    BONE_A,
    BONE_B,
    POSITION_A,
    POSITION_B,
    ROTATION_A,
    ROTATION_B,
    SCALE_A,
    SCALE_B,
  } = TP_TRACK_INDEX;

  // 클릭한 키프레임이 없을 경우
  if (!deleteTargetKeyframes.length) {
    switch (remainder) {
      // Layer 트랙인 경우
      case LAYER: {
        const keyframes = fnClickLayerKeyframe({
          dopeSheetList,
          lastBoneList,
          layerKey,
          time,
          trackIndex,
          trackName,
        });
        clickedKeyframes.push(...keyframes);
        break;
      }

      // Bone 트랙인 경우
      case BONE_A:
      case BONE_B: {
        const keyframes = fnClickBoneKeyframe({
          dopeSheetList,
          layerKey,
          time,
          trackIndex,
        });
        clickedKeyframes.push(...keyframes);
        break;
      }

      // Transform 트랙인 경우
      default: {
        clickedKeyframes.push({
          isTransformTrack: true,
          isLocked,
          key: `${layerKey}&&${trackName}&&${time}`,
          trackIndex,
          trackName,
          layerKey,
          time,
        });
        break;
      }
    }
    return clickedKeyframes;
  }
  // 클릭한 키프레임이 있을 경우
  else {
    for (let curTrackIndex = 0; curTrackIndex < deleteTargetKeyframes.length; curTrackIndex += 1) {
      const track = deleteTargetKeyframes[curTrackIndex];
      // 선택 효과가 적용 된 본인 트랙을 클릭 할 경우
      if (track.trackIndex === trackIndex && track.time === time) {
        switch (remainder) {
          // Layer 트랙인 경우
          case LAYER: {
            const nextState = produce(deleteTargetKeyframes, (draft) => {
              return _.filter(draft, (keyframe) => keyframe.time !== time);
            });
            return nextState;
          }

          // Bone 트랙인 경우
          case BONE_A:
          case BONE_B: {
            const layerIndex = _.floor(trackIndex / 10000) * 10000 + 2;
            const positionIndex = trackIndex + 1;
            const rotationIndex = trackIndex + 2;
            const scaleIndex = trackIndex + 3;
            const nextState = produce(deleteTargetKeyframes, (draft) => {
              return _.filter(draft, (keyframe) => {
                if (keyframe.time !== time) return true;
                else if (
                  keyframe.time === time &&
                  keyframe.trackIndex !== layerIndex &&
                  keyframe.trackIndex !== trackIndex &&
                  keyframe.trackIndex !== positionIndex &&
                  keyframe.trackIndex !== rotationIndex &&
                  keyframe.trackIndex !== scaleIndex
                )
                  return true;
                return false;
              });
            });
            return nextState;
          }

          // Transform 트랙인 경우
          default: {
            const layerIndex = _.floor(trackIndex / 10000) * 10000 + 2;
            const getBoneTrackIndex = (index: number) => {
              if (remainder === POSITION_A || remainder == POSITION_B) return index - 1;
              if (remainder === ROTATION_A || remainder == ROTATION_B) return index - 2;
              if (remainder === SCALE_A || remainder == SCALE_B) return index - 3;
            };
            const nextState = produce(deleteTargetKeyframes, (draft) => {
              return _.filter(draft, (keyframe) => {
                if (keyframe.time !== time) return true;
                else if (
                  keyframe.time === time &&
                  keyframe.trackIndex !== layerIndex &&
                  keyframe.trackIndex !== trackIndex &&
                  keyframe.trackIndex !== getBoneTrackIndex(trackIndex)
                )
                  return true;
                return false;
              });
            });
            return nextState;
          }
        }
      }
    }

    // 중간에 for문이 return되지 않고 끝까지 순회했을 경우, 선택 적용 된 리스트에 클릭한 트랙 리스트 추가
    clickedKeyframes.push(...deleteTargetKeyframes);
    switch (remainder) {
      // Layer 트랙인 경우
      case LAYER: {
        const keyframes = fnClickLayerKeyframe({
          dopeSheetList,
          lastBoneList,
          layerKey,
          time,
          trackIndex,
          trackName,
        });
        clickedKeyframes.push(...keyframes);
        break;
      }

      // Bone 트랙인 경우
      case BONE_A:
      case BONE_B: {
        const keyframes = fnClickBoneKeyframe({
          dopeSheetList,
          layerKey,
          time,
          trackIndex,
        });
        clickedKeyframes.push(...keyframes);
        break;
      }

      // Transform 트랙인 경우
      default: {
        clickedKeyframes.push({
          isTransformTrack: true,
          isLocked,
          key: `${layerKey}&&${trackName}&&${time}`,
          trackIndex,
          trackName,
          layerKey,
          time,
        });
        break;
      }
    }
    return clickedKeyframes;
  }
};

export default fnClickAnyKeyframeToCtrl;
