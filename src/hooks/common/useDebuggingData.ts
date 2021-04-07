import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setAnimatingData,
  setCurrentVisualizedData,
  setMainData,
  setRenderingData,
  setTPDopeSheetList,
} from 'redux/homeSlice';
import { CurrentVisualizedDataType, LPDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RecordingDataType, RenderingDataType } from 'types/RP';
import { TPDopeSheet } from 'types/TP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  lpData: LPDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  animatingData: AnimatingDataType;
  currentVisualizedData: CurrentVisualizedDataType | undefined;
  tpDopeSheetList: TPDopeSheet[];
}

export const useDebuggingData = ({
  lpData,
  cpData,
  renderingData,
  animatingData,
  currentVisualizedData,
  tpDopeSheetList,
}: useDebuggingDataProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDebug) {
      dispatch(setMainData(lpData));
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
      dispatch(setTPDopeSheetList(tpDopeSheetList));
    }
  }, [dispatch, tpDopeSheetList]);
};
