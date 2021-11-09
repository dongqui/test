import { KeyframesState } from '../index';

class StateUpdate {
  protected readonly state: KeyframesState;

  constructor(state: KeyframesState) {
    this.state = state;
  }

  public updateState(newValues: Partial<KeyframesState>) {
    return Object.assign({}, this.state, newValues);
  }
}

export default StateUpdate;
