import { MutableRefObject } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

type d3ScaleLinear = d3.ScaleLinear<number, number, never>;

interface FnMovePlayBarWithAnimation {
  action: THREE.AnimationAction;
  playBarPositionRef: MutableRefObject<number>;
  prevXScale: MutableRefObject<d3ScaleLinear | d3.ZoomScale | null>;
  startTimeIndex: number;
}

const X_AXIS_HEIGHT = 48; // 트랙 높이

/**
 * 애니메이션 time 에 따라 재생바를 수평 이동합니다.
 *
 * @param action - time 을 구할 action 입니다.
 * @param playBarPositionRef - playBar 위치의 ref 값 입니다.
 * @param prevXScale - svg 재렌더링을 위한 ref 값 입니다.
 * @param startTimeIndex - 정지 시 돌아갈 index
 *
 */
const fnMovePlayBarWithAnimation = (props: FnMovePlayBarWithAnimation) => {
  const { action, playBarPositionRef, prevXScale, startTimeIndex } = props;

  let reqId: number | undefined;

  const setPlayBarPosition = () => {
    if (playBarPositionRef) {
      playBarPositionRef.current = action.time * 30;
      const xScaleLinear = prevXScale.current as d3ScaleLinear;
      d3.select('#play-bar-wrapper').attr(
        'transform',
        `translate(${xScaleLinear(playBarPositionRef.current) - 10},
        ${X_AXIS_HEIGHT / 2})`,
      );
    }
  };

  const loop = () => {
    reqId = undefined;
    setPlayBarPosition();
    startLoop();
  };

  const startLoop = () => {
    if (!reqId) {
      reqId = requestAnimationFrame(loop);
    }
  };

  const pauseLoop = () => {
    if (reqId) {
      playBarPositionRef.current = startTimeIndex;
      cancelAnimationFrame(reqId);
      reqId = undefined;
    }
  };

  const stopLoop = () => {
    if (reqId) {
      playBarPositionRef.current = _.floor(action.time * 30, 0);
      cancelAnimationFrame(reqId);
      reqId = undefined;
    }
  };

  return {
    startLoop,
    pauseLoop,
    stopLoop,
  };
};

export default fnMovePlayBarWithAnimation;
