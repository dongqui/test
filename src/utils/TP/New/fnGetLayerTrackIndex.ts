interface FnGetLayerTrackIndex {
  trackIndex: number;
}

const fnGetLayerTrackIndex = ({ trackIndex }: FnGetLayerTrackIndex) => {
  return Math.floor(trackIndex / 10000) * 10000 + 2;
};

export default fnGetLayerTrackIndex;
