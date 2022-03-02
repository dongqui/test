import { PlaskEngine } from '3d/PlaskEngine';

export abstract class Module<ModuleState> {
  constructor(public plaskEngine: PlaskEngine) {}
  public initialize() {}
  public dispose() {}

  public abstract state: ModuleState;
  public onStateChanged(diff: Partial<ModuleState>){}
}
