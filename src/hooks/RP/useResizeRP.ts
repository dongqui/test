import _ from 'lodash';
import { useEffect, useReducer, useState } from 'react';
import { RndResizeCallback } from 'react-rnd';
import { CONTROL_RATE, LIBRARY_RATE, MIN_WIDTH, TIMELINE_RATE } from 'styles/constants/panels';

/**
 * | ------- | ------------------------- | ------- | ----
 * | Library | ------- Rendering ------- | Control |    | -> UpperSection
 * | ------- | ------------------------- | ------- | ----
 * | ----------------- PlayBar ------------------- | ----
 * | --------------------------------------------- |    |
 * | ----------------- Timeline ------------------ |    | -> LowerSection
 * | --------------------------------------------- | ----
 *
 * UpperSection: Library, Rendering, Control
 * LowerSection: MiddlBar, Timeline
 */
type Section = 'upper' | 'lower';
type Panel = 'library' | 'rendering' | 'control' | 'timeline';

type Action =
  | { type: 'RESIZE'; position: 'LOWER'; nextState: State }
  | { type: 'RESIZE'; position: 'BROWSER'; nextState: State }
  | { type: 'RESIZE'; position: 'LIBRARY'; nextState: State }
  | { type: 'RESIZE'; position: 'CONTROL'; nextState: State };

interface PanelSpec {
  x: number;
  y: number;
  width: string | number;
  height: string | number;
}

type State = {
  [key in Section | Exclude<Panel, 'timeline'>]: PanelSpec;
};

const reducer = (state: State, action: Action) => {
  switch (action.position) {
    case 'BROWSER':
    case 'CONTROL':
    case 'LIBRARY':
    case 'LOWER': {
      return {
        ...state,
        ...action.nextState,
      };
    }

    default: {
      const message = 'Develop Error: unexpected action type';
      throw new Error(message);
    }
  }
};

/**
 *
 * @example
 * ```
 * # Usage
 * const value = getNumberValue('358px'); // 358
 * ```
 * @param {string} targetValue - 숫자와 px을 분리하기위한 기존값
 * @returns {number} px을 분리한 값
 */
export const getNumberValue = (targetValue: string): number => {
  const startUnitIndex = targetValue.indexOf('px');
  const resultValue = Number(targetValue.substr(0, startUnitIndex));

  return resultValue;
};

export const useResizeRP = () => {
  const [initialState] = useState<State>({
    upper: {
      width: '100%',
      height: window.innerHeight - window.innerHeight * TIMELINE_RATE.height,
      x: 0,
      y: 0,
    },
    lower: {
      width: '100%',
      height: window.innerHeight * TIMELINE_RATE.height,
      x: 0,
      y: window.innerHeight * (1 - TIMELINE_RATE.height),
    },
    library: {
      width: MIN_WIDTH.library,
      height: '100%',
      x: 0,
      y: 0,
    },
    rendering: {
      width: window.innerWidth - MIN_WIDTH.library - MIN_WIDTH.control,
      height: '100%',
      x: MIN_WIDTH.library,
      y: 0,
    },
    control: {
      width: MIN_WIDTH.control,
      height: '100%',
      x: window.innerWidth - MIN_WIDTH.control,
      y: 0,
    },
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  // 패널 Resize event에 대한 Panel resize handler
  const handleResizeStop: RndResizeCallback = (_e, _dir, ref, _delta, position) => {
    const panelRefId = _.upperCase(_.split(ref.id, '_')[1]) as Action['position'];

    switch (panelRefId) {
      case 'LOWER': {
        const timelineHeight = getNumberValue(ref.style.height);

        const nextState: State = {
          ...state,
          lower: {
            ...state.lower,
            ...position,
            height: timelineHeight,
          },
          upper: {
            ...state.upper,
            height: window.innerHeight - timelineHeight,
          },
        };

        dispatch({
          type: 'RESIZE',
          position: 'LOWER',
          nextState,
        });

        break;
      }

      case 'LIBRARY': {
        const libraryWidth = getNumberValue(ref.style.width);

        const nextState: State = {
          ...state,
          library: {
            ...state.library,
            width: libraryWidth,
          },
          rendering: {
            ...state.rendering,
            width: window.innerWidth - Number(state.control.width) - libraryWidth,
            x: libraryWidth,
          },
        };

        dispatch({
          type: 'RESIZE',
          position: 'LIBRARY',
          nextState,
        });

        break;
      }

      case 'CONTROL': {
        const controlWidth = getNumberValue(ref.style.width);

        const nextState: State = {
          ...state,
          rendering: {
            ...state.rendering,
            width: window.innerWidth - Number(state.library.width) - controlWidth,
          },
          control: {
            ...state.control,
            width: controlWidth,
            x: position.x,
          },
        };

        dispatch({
          type: 'RESIZE',
          position: 'CONTROL',
          nextState,
        });

        break;
      }

      default: {
        break;
      }
    }
  };

  /**
   * 브라우저 Resize event에 대한 Panel resize handler(delay: 100ms)
   *
   * ===WARN===
   * React-rnd에서 resize를 통한 width 계산 시, min-width와 max-width를 무시하는 문제가 있어서
   * 이를 고려한 resize width를 계산하여 처리함
   *
   * @todo 하위 계산식이 이해하기 난해하여 변수로 분리한 정리가 필요함
   */
  useEffect(() => {
    const handleResize = _.debounce(() => {
      // LP min-width, max-width로 인한 RP width계산을 위한 값
      const libraryPanelWidth =
        Number(state.library.width) > window.innerWidth * LIBRARY_RATE.maxWidth
          ? window.innerWidth * LIBRARY_RATE.maxWidth
          : Number(state.library.width) <= MIN_WIDTH.library
          ? MIN_WIDTH.library
          : Number(state.library.width);

      // CP min-width, max-width로 인한 RP width계산을 위한 값
      const controlPanelWidth =
        Number(state.control.width) > window.innerWidth * CONTROL_RATE.maxWidth
          ? window.innerWidth * CONTROL_RATE.maxWidth
          : Number(state.control.width) <= MIN_WIDTH.control
          ? MIN_WIDTH.control
          : Number(state.control.width);

      // LP, CP min-width, max-width를 감안한 RP width
      const renderingPanelWidth = Math.round(
        window.innerWidth - libraryPanelWidth - controlPanelWidth,
      );

      const timelinePanelHeight =
        Number(state.lower.height) > window.innerHeight * TIMELINE_RATE.maxHeight
          ? window.innerHeight * TIMELINE_RATE.maxHeight
          : Number(state.lower.height);

      const nextState: State = {
        upper: {
          ...state.upper,
          height: window.innerHeight - timelinePanelHeight,
        },
        lower: {
          ...state.lower,
          height: timelinePanelHeight,
          y: window.innerHeight - timelinePanelHeight,
        },
        library: {
          ...state.library,
          width: libraryPanelWidth,
        },
        rendering: {
          ...state.rendering,
          width: renderingPanelWidth,
          x: libraryPanelWidth,
        },
        control: {
          ...state.control,
          width: controlPanelWidth,
          x: libraryPanelWidth + renderingPanelWidth,
        },
      };

      dispatch({
        type: 'RESIZE',
        position: 'BROWSER',
        nextState,
      });
    }, 100);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [state.control, state.library, state.lower, state.rendering, state.upper]);

  const upperSection = {
    size: {
      width: state.upper.width,
      height: state.upper.height,
    },
  };

  const lowerSection = {
    size: {
      width: state.lower.width,
      height: state.lower.height,
    },
    position: {
      x: state.lower.x,
      y: state.lower.y,
    },
    minHeight: initialState.lower.height,
    maxHeight: window.innerHeight * TIMELINE_RATE.maxHeight,
  };

  const libraryPanel = {
    size: {
      width: state.library.width,
      height: state.library.height,
    },
    maxWidth:
      window.innerWidth * LIBRARY_RATE.maxWidth > MIN_WIDTH.library
        ? window.innerWidth * LIBRARY_RATE.maxWidth
        : MIN_WIDTH.library,
  };

  const renderingPanel = {
    size: {
      width: state.rendering.width,
      height: state.rendering.height,
    },
    position: {
      x: state.rendering.x,
      y: state.rendering.y,
    },
  };

  const controlPanel = {
    size: {
      width: state.control.width,
      height: state.control.height,
    },
    position: {
      x: state.control.x,
      y: state.control.y,
    },
    maxWidth:
      window.innerWidth * CONTROL_RATE.maxWidth > MIN_WIDTH.control
        ? window.innerWidth * CONTROL_RATE.maxWidth
        : MIN_WIDTH.control,
  };
  return {
    upperSection,
    handleResizeStop,
    libraryPanel,
    renderingPanel,
    lowerSection,
    controlPanel,
  };
};
