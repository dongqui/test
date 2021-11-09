export type PlayState = 'play' | 'pause' | 'stop';

// 리팩토링이 끝나면 PlayDirection type을 삭제하고, PlayDirection_New을 PlayDirection으로 이름 변경
export enum PlayDirection_New {
  forward = 1,
  backward = -1,
}
