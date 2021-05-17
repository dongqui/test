import * as THREE from 'three';
import _ from 'lodash';
import { fnQuaternionToEulerTrack } from 'utils/common';
import { ShootTrackType } from 'types';

interface FnGetBaseLayerWithTracks {
  bones: THREE.Bone[];
  tracks: THREE.VectorKeyframeTrack[] | THREE.QuaternionKeyframeTrack[];
}

/**
 * 모델의 Bones 정보와 animation clip 의 tracks 를 바탕으로 BaseLayer 에 해당하는 tracks 를 생성합니다.
 * 전체 Bone 에 대해 각 Bone 마다 position, rotation, scale 에 해당하는 track 들을 생성합니다.
 * 이때 애니메이션 내 트랙을 가지고 있지 않은(즉, 현재 애니메이션에서는 변하지 않는) Bone 및 property 에 대해서는 빈 배열을 추가합니다.
 *
 * @param bones - 로드된 모델의 bones 가 담긴 배열
 * @param tracks - 현재 컨트롤 대상인 animation clip 의 tracks
 *
 * @returns baseLayer 에 해당하는 tracks
 *
 */
const fnGetBaseLayerWithTracks = (props: FnGetBaseLayerWithTracks) => {
  const { bones, tracks: sourceTracks } = props;
  // 이미 존재하는 motion 에 대해 base layer 를 생성할 때
  const tracks = _.map(_.cloneDeep(sourceTracks), (track) =>
    _.includes(track.name, 'quaternion')
      ? fnQuaternionToEulerTrack({ quaternionTrack: track })
      : track,
  );
  const newTracks: ShootTrackType[] = [];
  _.forEach(bones, (bone) => {
    newTracks.push(
      ..._.map(['position', 'rotation', 'scale'], (property) => {
        const targetTrack = _.find(tracks, (track) => track.name === `${bone.name}.${property}`);
        if (targetTrack) {
          return {
            name: targetTrack.name,
            times: [...targetTrack.times],
            values: [...targetTrack.values],
            interpolation: 'linear',
            isIncluded: true,
          };
        } else {
          return {
            name: `${bone.name}.${property}`,
            times: [],
            values: [],
            interpolation: 'linear',
            isIncluded: true,
          };
        }
      }),
    );
  });
  return newTracks;
};

export default fnGetBaseLayerWithTracks;
