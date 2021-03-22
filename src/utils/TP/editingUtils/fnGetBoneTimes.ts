import _ from 'lodash';
import { ShootTrackType } from 'types';

interface FnGetBoneTimes {
  positionTrack: ShootTrackType;
  rotationTrack: ShootTrackType;
  scaleTrack: ShootTrackType;
}
/**
 * 대상 Bone 의 position, rotation, scale 의 times 를 합한 times 배열을 반환합니다.
 * Bone 트랙을 닫은 경우 돕싯을 찍을 때 사용할 수 있습니다.
 *
 * @param positionTrack - 대상 Bone 의 position track
 * @param rotationTrack - 대상 Bone 의 position track
 * @param scaleTrack - 대상 Bone 의 position track
 *
 * @returns 대상 Bone 의 position, rotation, scale 의 times 를 합한 times
 *
 */
const fnGetBoneTimes = (props: FnGetBoneTimes) => {
  const { positionTrack, rotationTrack, scaleTrack } = props;
  const targetTimes: Array<number[]> = [positionTrack.times, rotationTrack.times, scaleTrack.times];

  return _.union(targetTimes).sort();
};

export default fnGetBoneTimes;
