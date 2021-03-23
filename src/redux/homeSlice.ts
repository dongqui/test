import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import {
  INITIAL_CP_DATA,
  INITIAL_MAIN_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
} from 'utils/const';

const initialState = {
  mainData: INITIAL_MAIN_DATA,
  renderingData: INITIAL_RENDERING_DATA,
  cpData: INITIAL_CP_DATA,
  recordingData: INITIAL_RECORDING_DATA,
};
const homeSlice = createSlice({
  name: 'homeReducer',
  initialState,
  reducers: {
    setMainData(state, action) {
      state.mainData = action.payload;
    },
    setCpData(state, action) {
      state.cpData = action.payload;
    },
    setRenderingData(state, action) {
      state.renderingData = action.payload;
    },
    setRecordingData(state, action) {
      state.recordingData = action.payload;
    },
  },
  extraReducers: {},
});

export const { setMainData, setCpData, setRecordingData, setRenderingData } = homeSlice.actions;

export default homeSlice.reducer;
