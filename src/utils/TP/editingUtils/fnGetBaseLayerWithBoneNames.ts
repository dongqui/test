import _ from 'lodash';
import { ShootTrackType } from 'types';

interface FnGetBaseLayerWithBoneNames {
  boneNames: string[];
}

/**
 * 모델의 BoneNames 를 바탕으로 BaseLayer 에 해당하는 빈 tracks 를 생성합니다.
 * 빈 모션 추가 시 사용합니다.
 * 전체 Bone 에 대해 각 Bone 마다 position, rotation, scale 에 해당하는 빈 track 들을 생성합니다.
 *
 * @param boneNames - 로드된 모델의 boneName 가 담긴 배열
 *
 * @returns baseLayer 에 해당하는 tracks
 *
 */
const fnGetBaseLayerWithBoneNames = (props: FnGetBaseLayerWithBoneNames) => {
  const { boneNames } = props;
  // 빈 모션에 대해 baseLayer 를 생성할 때
  const newTracks: ShootTrackType[] = [];
  _.forEach(boneNames, (boneName) => {
    newTracks.push(
      ..._.map(['position', 'rotation', 'scale'], (property) => {
        return {
          name: `${boneName}.${property}`,
          times: [],
          values: [],
          interpolation: 'linear',
          isIncluded: true,
        };
      }),
    );
  });
  return newTracks;
};

export default fnGetBaseLayerWithBoneNames;
