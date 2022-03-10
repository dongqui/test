import { PlaskEngine } from '3d/PlaskEngine';

export abstract class Module {
  constructor(public plaskEngine: PlaskEngine) {}
  public initialize() {}
  public dispose() {}

  public onStateChanged(stateKey: string, key: string) {}
  public reduxObservedStates: string[] = [];
}
