import { useMemo } from 'react';

import { useSelector } from 'reducers';

import { LayerTrack } from './TrackList';

const DopeSheet = () => {
  const trackScrollTop = useSelector((state) => state.trackList.trackScrollTop);
  const selectedLayer = useSelector((state) => state.trackList.selectedLayer);
  const layerTrackList = useSelector((state) => state.trackList.layerTrackList);
  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  // layer 트랙들의 y값 계산
  const layerTranslateY = useMemo(() => {
    const selectedLayerIndex = layerTrackList.findIndex(({ layerId }) => layerId === selectedLayer);
    const layerCaretDown = layerTrackList[selectedLayerIndex].isPointedDownCaret;
    const result = Array(layerTrackList.length)
      .fill(1)
      .map((_, index) => index * 32);
    if (layerCaretDown) {
      let boneCaretDownCount = 0;
      for (let index = 0; index < boneTrackList.length; index++) {
        const boneCareDown = boneTrackList[index].isPointedDownCaret;
        if (boneCareDown) boneCaretDownCount += 1;
      }
      for (let index = selectedLayerIndex + 1; index < layerTrackList.length; index++) {
        const totalBoneHeight = boneTrackList.length * 24;
        const totalTransformHeight = boneCaretDownCount * 9 * 24;
        result[index] += totalBoneHeight + totalTransformHeight;
      }
    }
    return result;
  }, [boneTrackList, layerTrackList, selectedLayer]);

  return (
    <g transform={`translate(0 -${trackScrollTop})`}>
      {layerTrackList.map((layerTrack, index) => (
        <LayerTrack key={layerTrack.layerId} translateY={layerTranslateY[index]} {...layerTrack} />
      ))}
    </g>
  );
};

export default DopeSheet;
