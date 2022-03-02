import { PlaskEngine } from '3d/PlaskEngine';

type StateMutations = {
  actionTypes: string[];
  callback: (action: any, state: any) => void;
};
export abstract class Module<ModuleState> {
  constructor(public plaskEngine: PlaskEngine) {}
  public initialize() {}
  public dispose() {}

  public abstract state: ModuleState;
  public mutations: StateMutations[] = [];
  public onStateChanged(diff: Partial<ModuleState>) {}
}
