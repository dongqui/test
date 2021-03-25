import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAnimatingData, setMainData, setRenderingData } from 'redux/homeSlice';
import { MainDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RecordingDataType, RenderingDataType } from 'types/RP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  mainData: MainDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  animatingData: AnimatingDataType;
}

export const useDebuggingData = ({
  mainData,
  cpData,
  renderingData,
  animatingData,
}: useDebuggingDataProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDebug) {
      dispatch(setMainData(mainData));
    }
  }, [dispatch, mainData]);
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
};
