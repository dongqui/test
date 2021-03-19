export interface TPBoneTrack {
  children: string[];
  isChildTrackOpen: boolean;
  title: string;
}

export interface TPTransformTrack {
  interpolation: string;
  name: string;
  property: string;
  times: number[];
  keyframes: number[];
  x: number[];
  y: number[];
  z: number[];
}
