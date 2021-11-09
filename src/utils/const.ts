// TP Track 별 Index 규칙
export const TP_TRACK_INDEX = {
  SUMMARY: 1, // Summary 트랙
  LAYER: 2, // Layer 트랙(Base Layer, 사용자가 추가시킨 Layer)
  BONE: 3, // Bone 트랙 Index는 끝자리를 3으로 지정
  POSITION: 4, // Position 트랙 index는 끝자리를 4로 지정
  ROTATION: 5, // Rotation 트랙 index는 끝자리를 5로 지정
  SCALE: 6, // Scale 트랙 index는 끝자리를 6으로 지정
};

//////////////////// new ////////////////////

// filterFunction params(beta, minCutoff)의 기본값
// mocap 결과물이 아닌 경우, 항등원 성격의 0, 0을 사용합니다.
export const DEFAULT_BETA = 0.0;
export const DEFAULT_MIN_CUTOFF = 1.0;
// mocap 결과물인 경우, 다시 position / rotationQuaternion으로 구분한 기본값을 사용합니다.
export const MOCAP_POSITION_BETA = 0.002;
export const MOCAP_POSITION_MIN_CUTOFF = 0.05;
export const MOCAP_QUATERNION_BETA = 0.3;
export const MOCAP_QUATERNION_MIN_CUTOFF = 3.0;
