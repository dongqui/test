import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { ShootLayerType, ShootTrackType } from 'types';

interface FnGetNewLayer {
  name: string;
  bones: THREE.Bone[];
}

/**
 * 모델의 Bones 정보를 바탕으로 빈 Layer 에 해당하는 tracks 를 생성합니다.
 * 새로 생성되는 Layer 의 모든 track 들은 빈 배열입니다.
 *
 * @param name - 사용자가 입력한 layer name 혹은 중복 고려한 기본 layer name
 * @param bones - 로드된 모델의 bones 가 담긴 배열
 *
 * @returns layer 에 해당하는 tracks
 *
 */
const fnGetNewLayer = (props: FnGetNewLayer): ShootLayerType => {
  const { name, bones } = props;
  const newTracks: ShootTrackType[] = [];
  _.forEach(bones, (bone) => {
    newTracks.push(
      ..._.map(['position', 'rotation', 'scale'], (property) => ({
        name: `${bone.name}.${property}`,
        times: [],
        values: [],
        interpolation: 'linear',
        isIncluded: true,
      })),
    );
  });
  return {
    name,
    key: uuidv4(),
    tracks: newTracks,
  };
};

export default fnGetNewLayer;
