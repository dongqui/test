import * as THREE from 'three';
import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';
import { fnGetTrackUnionTimes, fnGetInterpolatedTrackLinear } from 'utils/TP/editingUtils';
import { fnEulerToQuaternionTrack } from 'utils/common';

interface FnGetAnimationClipForExport {
  name: string;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

/**
 * LP 에서 추출을 위해, base layer 와 layers 를 통해 새로운 animation clip 을 생성 후 반환합니다.
 * startTimeIndex, endTimeIndex, isIncluded 등과 무관하게 모든 track 의 전체 길이를 clip 으로 생성합니다.
 *
 * @param name - 생성할 clip 의 name
 * @param baseLayer - base layer
 * @param layers - other layers
 *
 * @returns 생성한 animation clip
 */
const fnGetAnimationClipForExport = (props: FnGetAnimationClipForExport) => {
  let duration = 0; // track 들의 union times 중 가장 큰 애들 비교하면서 교체
  const { name, baseLayer, layers } = props;
  // baseLayer 와 layers 를 사용한다.
  // 각 layers 들은 동일한 track 들로 채워져있다.

  const tracks: THREE.VectorKeyframeTrack[] = [];
  _.forEach(baseLayer, (track) => {
    const unionTimes = fnGetTrackUnionTimes({ track, baseLayer, layers });
    if (duration < unionTimes[unionTimes.length - 1]) {
      duration = unionTimes[unionTimes.length - 1];
    }
    // base layer 의 track interpolate
    const baseInterpolatedTrack = fnGetInterpolatedTrackLinear({ unionTimes, track });
    const valuesArray = [baseInterpolatedTrack.values];
    if (layers.length !== 0) {
      // zip 활용
      _.forEach(layers, (layer) => {
        const layerTrack = _.find(layer.tracks, (tr) => tr.name === track.name);
        if (layerTrack) {
          const layerInterpolatedTrack = fnGetInterpolatedTrackLinear({
            unionTimes,
            track: layerTrack,
          });
          valuesArray.push(layerInterpolatedTrack.values);
        }
      });
    }
    const unionValues =
      valuesArray.length === 1
        ? baseInterpolatedTrack.values
        : _.zipWith(...valuesArray, (...item) => _.sum(item));
    // times 와 values 값을 가진 유효한 track 들만 추가
    if (unionTimes.length !== 0 && unionValues.length !== 0) {
      tracks.push(new THREE.VectorKeyframeTrack(track.name, unionTimes, unionValues));
    }
  });

  // rotation track 들 quaternion track 으로 변환
  const rotationConvertedTracks = _.map(tracks, (track) =>
    _.includes(track.name, 'rotation') ? fnEulerToQuaternionTrack({ eulertrack: track }) : track,
  );

  return new THREE.AnimationClip(name, duration, rotationConvertedTracks);
};

export default fnGetAnimationClipForExport;
