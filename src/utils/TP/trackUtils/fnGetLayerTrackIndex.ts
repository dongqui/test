interface FnGetLayerTrackIndex {
  trackIndex: number;
}

/**
 * transform track 혹은 bone track의 layer index를 찾을 때 사용하는 함수입니다.
 * layer inde은 2, 10002, 20002와 같이 10000씩 간격을 두고 있습니다.
 *
 * @param trackIndex
 * @returns
 */

const fnGetLayerTrackIndex = ({ trackIndex }: FnGetLayerTrackIndex) => {
  return Math.floor(trackIndex / 10000) * 10000 + 2;
};

export default fnGetLayerTrackIndex;
