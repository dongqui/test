import React, { useCallback, useEffect, useState, useReducer } from 'react';
import _ from 'lodash';
import { Rnd } from 'react-rnd';
import { useReactiveVar } from '@apollo/client';
import { CONTEXTMENU_INFO, MAIN_DATA } from 'lib/store';
import { LIBRARYPANEL_INFO, TIMELINEPANEL_INFO } from 'styles/common';
import { LibraryPanel } from 'components/Panels/LibraryPanel';
import TimelinePanel from 'components/Panels/TimelinePanel';
import { RenderingController } from 'components/Panels/RenderingPanel/RenderingController';

/**
 * | ------- | ------------------------- | ------- |
 * | Library | ------- Rendering ------- | Control |
 * | ------- | ------------------------- | ------- |
 * | ----------------- MiddleBar ----------------- |
 * | --------------------------------------------- |
 * | ----------------- Timeline ------------------ |
 * | --------------------------------------------- |
 *
 * UpperSection: Library, Rendering, Control
 * LowerSection: MiddlBar, Timeline
 */
type Section = 'upper' | 'lower' | 'library' | 'rendering' | 'control';

type Action =
  | { type: 'RESIZE'; position: 'BROWSER'; nextState: State }
  | { type: 'RESIZE'; position: 'LOWER'; nextState: State }
  | { type: 'RESIZE'; position: 'LIBRARY'; nextState: State }
  | { type: 'RESIZE'; position: 'CONTROL'; nextState: State };

interface Panel {
  x: number;
  y: number;
  width: string | number;
  height: string | number;
}

type State = {
  [key in Section]: Panel;
};

const reducer = (state: State, action: Action): State => {
  switch (action.position) {
    case 'BROWSER':
    case 'LOWER':
    case 'LIBRARY':
    case 'CONTROL': {
      return {
        ...state,
        ...action.nextState,
      };
    }

    default: {
      throw new Error('Develop Error: unexpected action type');
    }
  }
};

const MainContainer: React.FC = () => {
  const mainData = useReactiveVar(MAIN_DATA);

  const handleClick = useCallback(() => {
    MAIN_DATA(
      _.map(mainData, (item) => ({
        ...item,
        isPlay: item.isVisualized ? !item.isPlay : item.isPlay,
      })),
    );
  }, [mainData]);

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
      height: window.innerHeight - window.innerHeight * TIMELINEPANEL_INFO.heightRate,
      x: 0,
      y: 0,
    },

    lower: {
      width: '100%',
      height: window.innerHeight * TIMELINEPANEL_INFO.heightRate,
      x: 0,
      y: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
    },

    library: {
      width: 230,
      height: '100%',
      x: 0,
      y: 0,
    },

    rendering: {
      width: window.innerWidth - 230 * 2,
      height: '100%',
      x: 230,
      y: 0,
    },

    control: {
      width: 230,
      height: '100%',
      x: window.innerWidth - 230,
      y: 0,
    },
  });

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    const panelRefId = _.upperCase(_.split(ref.id, '_')[1]) as Action['position'];

    switch (panelRefId) {
      case 'LOWER': {
        const startUnitIndex = ref.style.height.indexOf('px');
        const timelineHeight = ref.style.height.substr(0, startUnitIndex);

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
        const libraryWidth = ref.style.width.substr(0, startUnitIndex);

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
        const controlWidth = ref.style.width.substr(0, startUnitIndex);

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

  useEffect(() => {
    // 브라우저 Resize event에 대한 Panel resize handler(delay: 100ms)
    const handleResize = _.debounce(() => {
      const renderingPanelWidth = Math.round(
        window.innerWidth - Number(state.library.width) - Number(state.control.width),
      );

      const timelinePanelHeight = window.innerHeight * TIMELINEPANEL_INFO.heightRate;

      const nextState: State = {
        upper: {
          ...state.upper,
          height: window.innerHeight - timelinePanelHeight,
        },
        lower: {
          ...state.lower,
          height: timelinePanelHeight,
          y: window.innerHeight * (1 - TIMELINEPANEL_INFO.heightRate),
        },
        library: {
          ...state.library,
        },
        rendering: {
          ...state.rendering,
          width: renderingPanelWidth,
        },
        control: {
          ...state.control,
          x: Number(state.library.width) + Number(renderingPanelWidth),
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

  const { upper, lower, library, rendering, control } = state;

  return (
    <>
      <Rnd
        id="wrapper_upper"
        size={{
          width: upper.width,
          height: upper.height,
        }}
        disableDragging
        enableResizing={false}
      >
        <Rnd
          id="wrapper_library"
          disableDragging
          minWidth={initialState.library.width}
          enableResizing={{
            right: true,
          }}
          onResizeStop={handleResizeStop}
          size={{
            width: library.width,
            height: library.height,
          }}
        >
          <LibraryPanel />
        </Rnd>
        <Rnd
          id="wrapper_rendering"
          size={{
            width: rendering.width,
            height: rendering.height,
          }}
          enableResizing={false}
          disableDragging
          onDrop={handleDrop}
          onClick={handleClick}
          position={{
            x: rendering.x,
            y: rendering.y,
          }}
        >
          <RenderingController
            animationIndex={1}
            fileUrl={_.find(mainData, ['isVisualized', true])?.url}
            height="100%"
            id="container"
            width="100%"
            isPlay={_.find(mainData, ['isVisualized', true])?.isPlay}
            motionData={[]}
          />
        </Rnd>
        <Rnd
          id="wrapper_control"
          disableDragging
          minWidth={initialState.control.width}
          enableResizing={{ left: true }}
          onResizeStop={handleResizeStop}
          onDrop={handleDrop}
          onClick={handleClick}
          size={{
            width: control.width,
            height: control.height,
          }}
          position={{
            x: control.x,
            y: control.y,
          }}
        >
          <div style={{ backgroundColor: 'green', height: '100%' }}>asdasasd</div>
        </Rnd>
      </Rnd>
      <Rnd
        id="wrapper_lower"
        size={{
          width: lower.width,
          height: lower.height,
        }}
        minHeight={initialState.lower.height}
        onResizeStop={handleResizeStop}
        position={{
          x: lower.x,
          y: lower.y,
        }}
        enableResizing={{ top: true }}
        disableDragging={true}
      >
        <div style={{ height: '48px', backgroundColor: 'cyan' }}>Middle Bar</div>
        {/* <TimelinePanel width={window.innerWidth} height={window.innerHeight} /> */}
        <div style={{ backgroundColor: 'yellow', height: `calc(100% - 48px)` }}></div>
      </Rnd>
    </>
  );
};

export default React.memo(MainContainer);
