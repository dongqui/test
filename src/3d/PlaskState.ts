import { Entity } from "./entities/Entity";
import { Module } from "./modules/Module";

class PlaskStateSingleton {
  private _entities: {[id: string]: Entity} = {};

  constructor() {

  }

  public persist(obj: Object) {

  }

  public action(id: string, field: string, value: any) {
    if (!this._entities[id]) {
      console.warn('Entity not found');
      return;
    }

    (this._entities[id] as any)[field] = value;

    // Notify redux that Plask internal state has changed
  }

  public addState(name: string, object: any) {

  }

  public commit<S>(module: Module<S>, value: Partial<S>): S {
    // sync with redux store
    module.state = Object.assign({}, module.state, value);
    module.onStateChanged(value);
    return module.state;
  }
}

export const PlaskState = new PlaskStateSingleton();