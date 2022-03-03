import { PlaskEngine } from '3d/PlaskEngine';

type StateMutations = {
  actionTypes: string[];
  callback: (action: any, state: any) => void;
};
export type ModuleState = {
  [name: string]: {
    value: any;
    reduxPath: string;
    _onChanged?: () => void;
  };
};
export abstract class Module<S extends ModuleState> {
  constructor(public plaskEngine: PlaskEngine) {}
  public initialize() {}
  public dispose() {}

  public abstract state: S;
  public mutations: StateMutations[] = [];
  public onStateChanged(diff: Partial<S>) {}
  public commit(diff: { [name: keyof ModuleState]: any }) {
    // TODO : this allows only 1 stage of diff
    for (const key in diff) {
      if (this.state[key]) {
        this.state[key].value = diff[key];
        if (!this.state[key]._onChanged) {
          console.warn('Could not sync state with redux');
          return;
        }
        this.state[key]._onChanged!();
      }
    }
  }
  private _getNested(obj: any, path: string) {
    return path.split('.').reduce((p, c) => (p && p[c]) || null, obj);
  }
  private _setNested(obj: any, path: string, value: any) {
    return path.split('.').reduce((o, p, i) => (o[p] = path.split('.').length === ++i ? value : o[p] || {}), obj);
  }
}
