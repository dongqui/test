import { Entity } from './entities/Entity';
import { Module, ModuleState } from './modules/Module';
import { PlaskEngine } from './PlaskEngine';

type PlaskGlobalState = {};
class PlaskStateSingleton {
  private _entities: { [id: string]: Entity } = {};

  constructor() {}
  public globalState = {} as PlaskGlobalState;

  public commit<S extends ModuleState>(module: Module<S>, value: Partial<S>): S {
    // sync with redux store
    module.state = Object.assign({}, module.state, value);
    module.onStateChanged(value);
    return module.state;
  }

  public action(action: any, state: any) {
    let engine;
    if ((engine = PlaskEngine.GetInstance())) {
      engine.dispatch(action, state);
    }
  }
}

export const PlaskState = new PlaskStateSingleton();
