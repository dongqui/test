import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCpData, setMainData, setRenderingData } from 'redux/homeSlice';
import { MainDataTypes } from 'types';
import { CP_DATA_TYPES } from 'types/CP';
import { RENDERING_DATA_TYPES } from 'types/RP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  mainData: MainDataTypes[];
  cpData: CP_DATA_TYPES[];
  renderingData: RENDERING_DATA_TYPES;
}

export const useDebuggingData = ({ mainData, cpData, renderingData }: useDebuggingDataProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDebug) {
      dispatch(setMainData(mainData));
    }
  }, [dispatch, mainData]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setCpData(cpData));
    }
  }, [dispatch, cpData]);
  useEffect(() => {
    if (isDebug) {
      dispatch(setRenderingData(renderingData));
    }
  }, [dispatch, renderingData]);
};
