import * as THREE from 'three';
import _ from 'lodash';

interface FnGetNewLayer {
  bones: THREE.Bone[];
}

/**
 * 모델의 Bones 정보를 바탕으로 빈 Layer 에 해당하는 tracks 를 생성합니다.
 * 새로 생성되는 Layer 의 모든 track 들은 빈 배열입니다.
 *
 * @param bones - 로드된 모델의 bones 가 담긴 배열
 *
 * @returns layer 에 해당하는 tracks
 *
 */
const fnGetNewLayer = (props: FnGetNewLayer) => {
  const { bones } = props;
  const newTracks: Array<{
    name: string;
    times: number[];
    values: number[];
    interpolation: string;
  }> = [];
  _.forEach(bones, (bone) => {
    newTracks.push(
      ..._.map(['position', 'rotation', 'scale'], (property) => ({
        name: `${bone.name}.${property}`,
        times: [],
        values: [],
        interpolation: 'linear',
      })),
    );
  });
  return newTracks;
};

export default fnGetNewLayer;
