import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setAnimatingData,
  setCurrentVisualizedData,
  setLpData,
  setRenderingData,
  setTPTrackListList,
} from 'redux/homeSlice';
import { CurrentVisualizedDataType, LPDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RenderingDataType } from 'types/RP';
import { TPTrackList } from 'types/TP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  lpData: LPDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  animatingData: AnimatingDataType;
  currentVisualizedData: CurrentVisualizedDataType | undefined;
  TPTrackListList: TPTrackList[];
}

export const useDebuggingData = ({
  lpData,
  cpData,
  renderingData,
  animatingData,
  currentVisualizedData,
  TPTrackListList,
}: useDebuggingDataProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDebug) {
      dispatch(setLpData(lpData));
    }
  }, [dispatch, lpData]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setRenderingData(renderingData));
    }
  }, [dispatch, renderingData]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setAnimatingData(animatingData));
    }
  }, [animatingData, dispatch]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setCurrentVisualizedData(currentVisualizedData));
    }
  }, [currentVisualizedData, dispatch]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setTPTrackListList(TPTrackListList));
    }
  }, [dispatch, TPTrackListList]);
};
