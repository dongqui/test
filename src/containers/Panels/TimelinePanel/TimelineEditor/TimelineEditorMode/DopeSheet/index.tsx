import { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { deleteKeyframes } from 'actions/keyframes';
import { useSelector } from 'reducers';

import { LayerTrack } from './TrackList';

const DopeSheet = () => {
  const dispatch = useDispatch();

  const trackScrollTop = useSelector((state) => state.trackList.trackScrollTop);
  const selectedLayer = useSelector((state) => state.trackList.selectedLayer);
  const layerTrackList = useSelector((state) => state.trackList.layerTrackList);
  const boneTrackList = useSelector((state) => state.trackList.boneTrackList);

  // const propertyTrackList = useSelector((state) => state.keyframes.propertyTrackList);
  // const selectedPropertyKeyframes = useSelector(
  //   (state) => state.keyframes.selectedPropertyKeyframes,
  // );
  // console.log(propertyTrackList);
  // console.log(selectedPropertyKeyframes);

  // layer 트랙 translateY 계산
  const layerTranslateY = useMemo(() => {
    const selectedLayerIndex = layerTrackList.findIndex(({ trackId }) => trackId === selectedLayer);
    const layerCaretDown = layerTrackList[selectedLayerIndex].isPointedDownCaret;
    const result = Array(layerTrackList.length)
      .fill(1)
      .map((_, index) => index * 32);
    if (layerCaretDown) {
      let boneCaretDownCount = 0;
      for (let index = 0; index < boneTrackList.length; index++) {
        const boneCaretDown = boneTrackList[index].isPointedDownCaret;
        if (boneCaretDown) boneCaretDownCount += 1;
      }
      for (let index = selectedLayerIndex + 1; index < layerTrackList.length; index++) {
        const totalBoneHeight = boneTrackList.length * 24;
        const totalTransformHeight = boneCaretDownCount * 3 * 24;
        result[index] += totalBoneHeight + totalTransformHeight;
      }
    }
    return result;
  }, [boneTrackList, layerTrackList, selectedLayer]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Delete') dispatch(deleteKeyframes());
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [dispatch]);

  return (
    <g transform={`translate(0 -${trackScrollTop})`}>
      {layerTrackList.map((layerTrack, index) => (
        <LayerTrack key={layerTrack.trackId} translateY={layerTranslateY[index]} {...layerTrack} />
      ))}
    </g>
  );
};

export default DopeSheet;
