import { RecordingDataAction } from 'actions/recordingData';
import { RecordingDataType } from 'types/VM';

type RecordingDataState = RecordingDataType;

const defaultState: RecordingDataState = {
  duration: 10,
  rangeBoxInfo: {
    // width: window.innerWidth * 0.9,
    // width: 1700,
    width: 0,
    height: 128,
    x: 0,
    barX: 0,
    y: 0,
  },
  isPlaying: false,
  motionName: '',
  isRecording: undefined,
  count: undefined,
};

export const recordingData = (state = defaultState, action: RecordingDataAction) => {
  switch (action.type) {
    case 'recordingData/SET_RECORDING_DATA': {
      return Object.assign({}, state, action.payload);
    }
    default: {
      return state;
    }
  }
};
