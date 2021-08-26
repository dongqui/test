import { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';

interface State {
  mode: boolean;
}

type Action = { type: 'SIMPLE_MODE'; mode: boolean };

type ResizeDispatch = Dispatch<Action>;

const ResizeStateContext = createContext<State>({ mode: false });

const ResizeDispatchContext = createContext<ResizeDispatch>(() => null);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SIMPLE_MODE': {
      return {
        ...state,
        mode: action.mode,
      };
    }
    default:
      throw new Error('Unhandled action');
  }
};

export const ResizeProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, {
    mode: false,
  });

  return (
    <ResizeStateContext.Provider value={state}>
      <ResizeDispatchContext.Provider value={dispatch}>{children}</ResizeDispatchContext.Provider>
    </ResizeStateContext.Provider>
  );
};

export const useLSResizeState = () => {
  const state = useContext(ResizeStateContext);

  if (!state) {
    throw new Error('Cannot find LSResizeProvider');
  }

  return state;
};

export const useLSResizeDispatch = () => {
  const dispatch = useContext(ResizeDispatchContext);

  if (!dispatch) {
    throw new Error('Cannot find LSResizeProvider');
  }

  return dispatch;
};
