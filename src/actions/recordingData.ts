import { RecordingDataType } from 'types/VM';

export type RecordingDataAction = ReturnType<typeof setRecordingData>;

type SetRecordingData = Partial<RecordingDataType>;
export const SET_RECORDING_DATA = 'recordingData/SET_RECORDING_DATA' as const;
export const setRecordingData = (params: SetRecordingData) => ({
  type: SET_RECORDING_DATA,
  payload: params,
});
