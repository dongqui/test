import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import {
  INITIAL_ANIMATING_DATA,
  INITIAL_MAIN_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
} from 'utils/const';

const initialState = {
  mainData: INITIAL_MAIN_DATA,
  renderingData: INITIAL_RENDERING_DATA,
  recordingData: INITIAL_RECORDING_DATA,
  animatingData: INITIAL_ANIMATING_DATA,
  currentVisualizedData: undefined,
};
const homeSlice = createSlice({
  name: 'homeReducer',
  initialState,
  reducers: {
    setMainData(state, action) {
      state.mainData = action.payload;
    },
    setRenderingData(state, action) {
      state.renderingData = action.payload;
    },
    setRecordingData(state, action) {
      state.recordingData = action.payload;
    },
    setAnimatingData(state, action) {
      state.animatingData = action.payload;
    },
    setCurrentVisualizedData(state, action) {
      state.currentVisualizedData = action.payload;
    },
  },
  extraReducers: {},
});

export const {
  setMainData,
  setRecordingData,
  setRenderingData,
  setAnimatingData,
  setCurrentVisualizedData,
} = homeSlice.actions;

export default homeSlice.reducer;
