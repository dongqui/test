import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setCurrentVisualizedData,
  setLpData,
  setRenderingData,
  setTPDopeSheetList,
} from 'redux/homeSlice';
import { LPDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RenderingDataType } from 'types/RP';
import { TPDopeSheet } from 'types/TP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  lpData: LPDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  tpDopeSheetList: TPDopeSheet[];
}

export const useDebuggingData = ({
  lpData,
  cpData,
  renderingData,
  tpDopeSheetList,
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
      dispatch(setTPDopeSheetList(tpDopeSheetList));
    }
  }, [dispatch, tpDopeSheetList]);
};
