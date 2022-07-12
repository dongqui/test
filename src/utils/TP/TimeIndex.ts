import { PlayState } from 'types/RP';

class TimeIndex {
  private static startTimeIndex = 0;
  private static endTimeIndex = 500;
  private static currentTimeIndex = 0;
  private static playState: PlayState = 'stop';

  static setStartTimeIndex(startTimeIndex: number) {
    TimeIndex.startTimeIndex = startTimeIndex;
  }

  static setEndTimeIndex(endTimeIndex: number) {
    TimeIndex.endTimeIndex = endTimeIndex;
  }

  static setCurrentTimeIndex(currentTimeIndex: number) {
    TimeIndex.currentTimeIndex = currentTimeIndex;
  }

  static setPlayState(playState: PlayState) {
    TimeIndex.playState = playState;
  }

  static getStartTimeIndex() {
    return TimeIndex.startTimeIndex;
  }

  static getEndTimeIndex() {
    return TimeIndex.endTimeIndex;
  }

  static getCurrentTimeIndex() {
    return TimeIndex.currentTimeIndex;
  }

  static getPlayState() {
    return TimeIndex.playState;
  }
}

export default TimeIndex;
