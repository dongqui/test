import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAnimatingData, setMainData, setRenderingData } from 'redux/homeSlice';
import { LPDataType } from 'types';
import { CPDataType } from 'types/CP';
import { AnimatingDataType, RecordingDataType, RenderingDataType } from 'types/RP';
import { isDebug } from 'utils/const';

interface useDebuggingDataProps {
  lpData: LPDataType[];
  cpData: CPDataType[];
  renderingData: RenderingDataType;
  animatingData: AnimatingDataType;
}

export const useDebuggingData = ({
  lpData,
  cpData,
  renderingData,
  animatingData,
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
};
