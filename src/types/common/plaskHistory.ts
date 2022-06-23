import { Reducer, Action, AnyAction } from 'redux';
import { RootState } from 'reducers';

export interface StateHistory<State> {
  past: State;
  present: State;
  future: State;
}

const createStateHistory = (past: any, present: any, future: any) => {
  return {
    past: past,
    present: present,
    future: future,
  };
};

export class PlaskCommand {
  private _action: AnyAction;
  private _state: StateHistory<any>;
  private _title: string;

  constructor(action: AnyAction, state: any, title: string = 'Untitled Command') {
    this._title = title;
    this._action = action;
    this._state = createStateHistory(state, {}, {});
  }

  get title() {
    return this._title;
  }
  get action() {
    return this._action;
  }
  get state() {
    return this._state;
  }

  public setPast(state: any): void {
    this._state.past = state;
  }

  public setPresent(state: any): void {
    this._state.present = state;
  }
  public setFuture(state: any): void {
    this._state.future = state;
  }
}

export interface PlaskHistory {
  id: string;
  history: Array<PlaskCommand>;
  pointer: number;
}
