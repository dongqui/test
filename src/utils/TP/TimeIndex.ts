class TimeIndex {
  private static startTimeIndex = 0;
  private static endTimeIndex = 100;
  private static currentTimeIndex = 0;

  static setStartTimeIndex(startTimeIndex: number) {
    TimeIndex.startTimeIndex = startTimeIndex;
  }

  static setEndTimeIndex(endTimeIndex: number) {
    TimeIndex.endTimeIndex = endTimeIndex;
  }

  static setCurrentTimeIndex(currentTimeIndex: number) {
    TimeIndex.currentTimeIndex = currentTimeIndex;
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
}

export default TimeIndex;
