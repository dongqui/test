import { PlaskEngine } from '3d/PlaskEngine';

export abstract class Module {
  constructor(public plaskEngine: PlaskEngine) {}
  /**
   * This function is call right after the PlaskEngine is initialized.
   */
  public initialize() {}

  /**
   * This functions is called when the PlaskEngine is disposed
   */
  public dispose() {}

  /**
   * This function is called when one of the states in `reduxObservedStates` has changed
   * @param key The key in `reduxObservedStates` that has triggered the state change
   * @param previousState The previous state before the reducer was called. To access the current state, use `plaskEngine.state`
   */
  public onStateChanged(key: string, previousState: any) {}

  /**
   * Array of keys to watch for changes in the state. To access nested field, use "."
   * For example : `path.to.state` will watch changes on `this.plaskEngine.state[path][to][state]`
   */
  public reduxObservedStates: string[] = [];

  /**
   * Called at the end of each render loop
   * @param elapsed Time elapsed in this tick
   */
  public tick(elapsed: number) {}
}
