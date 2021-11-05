import { TrackListState } from '../index';

class StateUpdate {
  protected readonly state: TrackListState;

  constructor(state: TrackListState) {
    this.state = state;
  }

  public updateState(newValues: Partial<TrackListState>) {
    return Object.assign({}, this.state, newValues);
  }
}

export default StateUpdate;
