export interface CONFIG_INFO {
  key: string;
  value: any;
  type: string;
  configType: string;
}
export interface RENDERING_DATA_TYPES {
  playSpeed: number;
  isPlay: boolean;
  playDirection: -1 | 1;
}
export interface RECORDING_DATA_TYPES {
  videoUrl: string;
  cutImages: string[];
}
