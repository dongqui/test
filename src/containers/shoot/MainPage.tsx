import React, { useCallback, useEffect, useState, useReducer } from 'react';
import _ from 'lodash';
import { Rnd, RndResizeCallback } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { LibraryPanel } from 'containers/Panels/LibraryPanel';
import TimelinePanel from 'containers/Panels/TimelinePanel';
import { ANIMATION_CLIP, RENDERING_DATA, MAIN_DATA, SKELETON_HELPERS, LP_MODE } from 'lib/store';
import { RenderingController } from 'containers/Panels/RenderingPanel/RenderingController';
import { LIBRARY_RATE, CONTROL_RATE, TIMELINE_RATE, MIN_WIDTH } from 'styles/constants/panels';
import { PlayBar } from 'containers/PlayBar';
import classNames from 'classnames/bind';
import styles from './MainPage.module.scss';
import { FILE_TYPES, MAINDATA_PROPERTY_TYPES } from 'interfaces';

const cx = classNames.bind(styles);

/**
 * | ------- | ------------------------- | ------- | ----
 * | Library | ------- Rendering ------- | Control |    | -> UpperSection
 * | ------- | ------------------------- | ------- | ----
 * | ----------------- MiddleBar ----------------- | ----
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

const MainContainer: React.FC = () => {
  const mainData = useReactiveVar(MAIN_DATA);
  const animationClip = useReactiveVar(ANIMATION_CLIP);
  const renderingData = useReactiveVar(RENDERING_DATA);
  const lpmode = useReactiveVar(LP_MODE);

  const handleDrop = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isVisualized: _.isEqual(item.key, _.find(mainData, ['isDragging', true])?.key),
      })),
    );
  }, [mainData]);

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

  const handleResizeStop: RndResizeCallback = (_e, _dir, ref, _delta, position) => {
    const panelRefId = _.upperCase(_.split(ref.id, '_')[1]) as Action['position'];

    switch (panelRefId) {
      case 'LOWER': {
        const startUnitIndex = ref.style.height.indexOf('px');
        const timelineHeight = Number(ref.style.height.substr(0, startUnitIndex));

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
        const startUnitIndex = ref.style.width.indexOf('px');
        const libraryWidth = Number(ref.style.width.substr(0, startUnitIndex));

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
        const startUnitIndex = ref.style.width.indexOf('px');
        const controlWidth = Number(ref.style.width.substr(0, startUnitIndex));

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
      // const upperSectionRate = 1 - TIMELINE_RATE.height;
      // const timelinePanelHeight = window.innerHeight * TIMELINE_RATE.height;

      // LP min-width, max-width로 인한 RP width계산을 위한 값
      const libraryPanelWidth =
        Number(state.library.width) >= MIN_WIDTH.library
          ? MIN_WIDTH.library
          : Number(state.library.width) > window.innerWidth * LIBRARY_RATE.maxWidth
          ? window.innerWidth * LIBRARY_RATE.maxWidth
          : Number(state.library.width);

      // CP min-width, max-width로 인한 RP width계산을 위한 값
      const controlPanelWidth =
        Number(state.control.width) >= MIN_WIDTH.control
          ? MIN_WIDTH.control
          : Number(state.control.width) > window.innerWidth * CONTROL_RATE.maxWidth
          ? window.innerWidth * CONTROL_RATE.maxWidth
          : Number(state.control.width);

      // LP, CP min-width, max-width를 감안한 RP width
      const renderingPanelWidth = Math.round(
        window.innerWidth - libraryPanelWidth - controlPanelWidth,
      );

      const timelinePanelHeight =
        Number(state.lower.height) >= window.innerHeight * TIMELINE_RATE.maxHeight
          ? window.innerHeight * TIMELINE_RATE.maxHeight
          : Number(state.lower.height);

      const nextState: State = {
        upper: {
          ...state.upper,
          // height: window.innerHeight - timelinePanelHeight,
          height: window.innerHeight - timelinePanelHeight,
        },
        lower: {
          ...state.lower,
          height: timelinePanelHeight,
          // y: window.innerHeight * upperSectionRate,
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

  return (
    <>
      <Rnd
        id="wrapper_upper"
        disableDragging
        enableResizing={false}
        size={{ ...upperSection.size }}
      >
        <Rnd
          id="wrapper_library"
          className={cx('library')}
          disableDragging
          enableResizing={{ right: true }}
          onResizeStop={handleResizeStop}
          minWidth={MIN_WIDTH.library}
          maxWidth={libraryPanel.maxWidth}
          size={{ ...libraryPanel.size }}
        >
          <LibraryPanel />
        </Rnd>
        <Rnd
          id="wrapper_rendering"
          disableDragging
          enableResizing={false}
          onDrop={handleDrop}
          size={{ ...renderingPanel.size }}
          position={{ ...renderingPanel.position }}
        >
          <RenderingController
            animationIndex={
              _.find(
                mainData,
                (item) =>
                  _.isEqual(item.type, FILE_TYPES.motion) && _.isEqual(item.isVisualized, true),
              )?.motionIndex
            }
            fileUrl={_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.url}
            id={`${_.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.key}${
              _.find(mainData, [MAINDATA_PROPERTY_TYPES.isVisualized, true])?.url
            }`}
            isPlay={renderingData.isPlay}
            playDirection={renderingData.playDirection}
            playSpeed={renderingData.playSpeed}
            motionData={[]}
          />
        </Rnd>
        <Rnd
          id="wrapper_control"
          disableDragging
          enableResizing={{ left: true }}
          onResizeStop={handleResizeStop}
          onDrop={handleDrop}
          minWidth={MIN_WIDTH.control}
          maxWidth={controlPanel.maxWidth}
          size={{ ...controlPanel.size }}
          position={{ ...controlPanel.position }}
        >
          <div style={{ backgroundColor: 'black', height: '100%' }}>Control Panel</div>
        </Rnd>
      </Rnd>
      <Rnd
        id="wrapper_lower"
        disableDragging
        enableResizing={{ top: true }}
        onResizeStop={handleResizeStop}
        minHeight={lowerSection.minHeight}
        maxHeight={lowerSection.maxHeight}
        size={{ ...lowerSection.size }}
        position={{ ...lowerSection.position }}
      >
        <PlayBar />
        <TimelinePanel data={animationClip?.tracks ?? []} />
      </Rnd>
    </>
  );
};

export default React.memo(MainContainer);
