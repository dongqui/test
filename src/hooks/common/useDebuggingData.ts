import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentVisualizedData, setLpData, setTPTrackListList } from 'redux/homeSlice';
import { LPDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RenderingDataType } from 'types/RP';
import { TPTrackList } from 'types/TP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  lpData: LPDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  TPTrackListList: TPTrackList[];
}

export const useDebuggingData = ({
  lpData,
  cpData,
  renderingData,
  TPTrackListList,
}: useDebuggingDataProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDebug) {
      dispatch(setLpData(lpData));
    }
  }, [dispatch, lpData]);
  // useEffect(() => {
  //   if (isDebug) {
  //     dispatch(setRenderingData(renderingData));
  //   }
  // }, [dispatch, renderingData]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setTPTrackListList(TPTrackListList));
    }
  }, [dispatch, TPTrackListList]);
};
