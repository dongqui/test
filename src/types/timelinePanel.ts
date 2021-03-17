export interface ShootTrackType {
  name: string;
  times: number[];
  values: number[];
  interpolation: string;
}

export interface ShootLayerType {
  name: string;
  key: string;
  tracks: ShootTrackType[];
}
