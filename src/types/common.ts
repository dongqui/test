export interface ShootTrackType {
  name: string;
  times: number[];
  values: number[];
  interpolation: string;
}

export interface ShootLayerType {
  key: string;
  tracks: ShootTrackType[];
}
