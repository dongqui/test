import * as THREE from 'three';
import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';
import fnGetTrackUnionTimes from './fnGetTrackUnionTimes';
import fnGetInterpolatedTrackLinear from './fnGetInterpolatedTrackLinear';
import fnEulerToQuaternionTrack from 'utils/common/fnEulerToQuaternionTrack';

interface FnGetAnimationClipForPlay {
  name: string;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
  startTimeIndex: number;
  endTimeIndex: number;
}

/**
 * RP 내 재생을 위해, base layer 와 layers 를 통해 새로운 animation clip 을 생성 후 반환합니다.
 * startTimeIndex, endTimeIndex 를 추가인자로 받아 길이를 조절하고, included 가 true 인 track 만을 사용합니다.
 *
 * @param name - 생성할 clip 의 name
 * @param baseLayer - base layer
 * @param layers - other layers
 * @param startTimeIndex - 미들바에서 설정한 시작 timeIndex 값
 * @param endTimeIndex - 미들바에서 설정한 끝 timeIndex 값
 *
 * @returns 생성한 animation clip
 */
const fnGetAnimationClipForPlay = (props: FnGetAnimationClipForPlay) => {
  let duration = 0; // track 들의 union times 중 가장 큰 애들 비교하면서 교체
  const {
    name,
    baseLayer: inputBaseLayer,
    layers: inputLayers,
    startTimeIndex,
    endTimeIndex,
  } = props;
  // baseLayer 와 layers 를 사용한다.
  // 각 layers 들은 동일한 track 들로 채워져있다.

  // track 중 included = true 인 track 만 사용한다.
  const baseLayer = _.filter(inputBaseLayer, (track: ShootTrackType) => track.included);
  const layers = _.cloneDeep(inputLayers);
  _.forEach(layers, (layer: ShootLayerType) => {
    layer.tracks = _.filter(layer.tracks, (track: ShootTrackType) => track.included);
  });

  const tracks: THREE.VectorKeyframeTrack[] = [];
  _.forEach(baseLayer, (track) => {
    // union time 을 구하되 start 및 end timeIndex 가 있으면 길이를 조절해서 clip 생성
    const unionTimes =
      startTimeIndex && endTimeIndex
        ? fnGetTrackUnionTimes({ track, baseLayer, layers }).filter(
            (time) =>
              time >= _.round(startTimeIndex * (1 / 30), 4) &&
              time <= _.round(endTimeIndex * (1 / 30), 4),
          )
        : fnGetTrackUnionTimes({ track, baseLayer, layers });
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

  // animation 의 duration 계산
  if (
    startTimeIndex &&
    endTimeIndex &&
    duration < _.round((endTimeIndex - startTimeIndex + 1) * (1 / 30), 4)
  ) {
    duration = _.round((endTimeIndex - startTimeIndex + 1) * (1 / 30), 4);
  }

  return new THREE.AnimationClip(name, duration, rotationConvertedTracks);
};

export default fnGetAnimationClipForPlay;
