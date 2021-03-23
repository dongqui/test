import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCpData, setMainData, setRenderingData } from 'redux/homeSlice';
import { MainDataType } from 'types';
import { CPDataType } from 'types/CP';
import { RecordingDataType, RenderingDataType } from 'types/RP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  mainData: MainDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
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
