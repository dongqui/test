// 패널 min-width(px)
export const MIN_WIDTH = {
  library: 230,
  control: 230,
} as const;

// 라이브러리 패널 비율(%)
export const LIBRARY_RATE = {
  maxWidth: 0.4,
};

// 컨트롤 패널 비율(%)
export const CONTROL_RATE = {
  maxWidth: 0.4,
};

// 타임라인 패널 width, height, max-height 비율(%)
export const TIMELINE_RATE = {
  width: 1,
  height: 0.3,
  maxHeight: 0.5,
} as const;
