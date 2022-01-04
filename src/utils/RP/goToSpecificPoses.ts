import { PlaskPose } from 'types/common';

/**
 * asset이 특정 포즈를 취하도록 합니다.
 * 모션 변경 시 initial pose를 적용해, track을 갖지 않는 transformNode들이 기본 포즈를 취하도록 하는 데 사용합니다.
 *
 * @param poses - 특정 포즈 정보
 */
const goToSpecificPoses = (poses: PlaskPose[]) => {
  poses.forEach((pose) => {
    const { target, position, rotationQuaternion, scaling } = pose;

    target.position = position.clone();
    target.rotationQuaternion = rotationQuaternion.clone();
    target.scaling = scaling.clone();
  });
};

export default goToSpecificPoses;
