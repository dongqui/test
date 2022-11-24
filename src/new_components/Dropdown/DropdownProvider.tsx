import { createContext, useReducer, ReactNode, useCallback } from 'react';

interface DropdownContextState {
  isOpenMenu: boolean;
}

interface ChangeIsOpenMenuPayload {
  isOpenMenu: boolean;
}

type ActionsMap = {
  changeIsOpenMenu: ChangeIsOpenMenuPayload;
};

type Actions = {
  [key in keyof ActionsMap]: {
    type: key;
    payload: ActionsMap[key];
  };
}[keyof ActionsMap];

type Dispatcher = <Type extends Actions['type'], Payload extends ActionsMap[Type]>(type: Type, ...payload: Payload extends undefined ? [undefined] : [Payload]) => void;

const initialstate: DropdownContextState = { isOpenMenu: false };

const reducer = (state: DropdownContextState, actions: Actions): DropdownContextState => {
  switch (actions.type) {
    case 'changeIsOpenMenu': {
      return { ...state, isOpenMenu: actions.payload.isOpenMenu };
    }
    default:
      throw new Error('Unhandled action');
  }
};

const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialstate);

  const useContextDispatch: Dispatcher = useCallback((type, ...payload) => {
    dispatch({ type, payload: payload[0] } as Actions);
  }, []);

  return <DropdownContext.Provider value={[state, useContextDispatch]}>{children}</DropdownContext.Provider>;
};

export const DropdownContext = createContext<[DropdownContextState, Dispatcher]>([initialstate, () => {}]);

export default DropdownProvider;
