import { v4 } from 'uuid';

export class PlaskCommand {
  private _action;
  private _state = {
    past: {},
    present: {},
  };
  private _title = '';
  constructor(action: any, state: any, title: string = 'Untitled Command') {
    this._title = title;
    this._action = action;
    this._state = {
      past: state,
      present: {},
    };
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

  public setPast(state: any) {
    this._state.present = state;
  }

  public setPresent(state: any) {
    this._state.present = state;
  }
}
