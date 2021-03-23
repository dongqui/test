import * as THREE from 'three';
import _ from 'lodash';
import { ShootLayerType, ShootTrackType } from 'types';
import fnGetTrackUnionTimes from './fnGetTrackUnionTimes';
import fnGetInterpolatedTrackLinear from './fnGetInterpolatedTrackLinear';
import fnEulerToQuaternionTrack from 'utils/common/fnEulerToQuaternionTrack';

interface FnGetAnimationClip {
  name: string;
  baseLayer: ShootTrackType[];
  layers: ShootLayerType[];
}

/**
 * base layer 와 layers 를 통해 새로운 animation clip 을 생성 후 반환합니다.
 *
 * @param name - 생성할 clip 의 name
 * @param baseLayer - base layer
 * @param layers - other layers
 *
 * @returns 생성한 animation clip
 */
const fnGetAnimationClip = (props: FnGetAnimationClip) => {
  let duration = 0; // track 들의 union times 중 가장 큰 애들 비교하면서 교체
  const { name, baseLayer, layers } = props;
  // baseLayer 와 layers 를 사용한다.
  // 각 layers 들은 동일한 track 들로 채워져있다.
  const tracks = _.map(baseLayer, (track) => {
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
    return new THREE.VectorKeyframeTrack(track.name, unionTimes, unionValues);
  });

  // rotation track 들 quaternion track 으로 변환
  const rotationConvertedTracks = _.map(tracks, (track) =>
    _.includes(track.name, 'rotation') ? fnEulerToQuaternionTrack({ eulertrack: track }) : track,
  );

  return new THREE.AnimationClip(name, duration, rotationConvertedTracks);
};

export default fnGetAnimationClip;
