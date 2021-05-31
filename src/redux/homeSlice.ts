import { createSlice } from '@reduxjs/toolkit';
import _ from 'lodash';
import {
  INITIAL_ANIMATING_DATA,
  INITIAL_LP_DATA,
  INITIAL_RECORDING_DATA,
  INITIAL_RENDERING_DATA,
} from 'utils/const';

const initialState = {
  lpData: INITIAL_LP_DATA,
  renderingData: INITIAL_RENDERING_DATA,
  recordingData: INITIAL_RECORDING_DATA,
  animatingData: INITIAL_ANIMATING_DATA,
  currentVisualizedData: undefined,
  TPTrackListList: [],
};
const homeSlice = createSlice({
  name: 'homeReducer',
  initialState,
  reducers: {
    setLpData(state, action) {
      state.lpData = action.payload;
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
    setTPTrackListList(state, action) {
      state.TPTrackListList = action.payload;
    },
  },
  extraReducers: {},
});

export const {
  setLpData,
  setRecordingData,
  setRenderingData,
  setAnimatingData,
  setCurrentVisualizedData,
  setTPTrackListList,
} = homeSlice.actions;

export default homeSlice.reducer;
