interface Subject {
  notify: (translateX: number) => void;
}

class Observer {
  private static keyframes: Subject[] = [];

  static subscribeKeyframe = (keyframe: Subject) => {
    this.keyframes.push(keyframe);
  };

  static notifyKeyframes = (translateX: number) => {
    this.keyframes.forEach((keyframe) => keyframe.notify(translateX));
  };

  static clearAllKeyframes = () => {
    this.keyframes = [];
  };
}

export default Observer;
