import { Nullable, Scene } from '@babylonjs/core';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';
import { PlaskTransformNode, PlaskTransformNodeSpec } from './PlaskTransformNode';

// TODO : move this
export type PlaskSpec = {
  [key: string]: PlaskEntitySpec;
};

export type EntityMap = { [id: string]: PlaskEntity };
export class EntityStore {
  private _entities: EntityMap = {};
  public get entities() {
    return this._entities;
  }

  constructor(public scene: Scene) {
    // TODO : remove debug
  }

  /**
   * Gets an entity by its id
   * @param id
   * @returns
   */
  public getEntity(id: string): PlaskEntity {
    if (!this._entities[id]) {
      throw new Error('Cannot find entity');
    }

    return this._entities[id];
  }

  public getEntitiesByPredicate(predicate: (entity: PlaskEntity) => boolean): PlaskEntity[] {
    const result = [];
    for (const entityId in this._entities) {
      if (predicate(this._entities[entityId])) {
        result.push(this._entities[entityId]);
      }
    }

    return result;
  }

  public async registerEntity(entity: PlaskEntity) {
    if (this._entities[entity.entityId]) {
      this._entities[entity.entityId].onDispose();
      this._entities[entity.entityId].copyFrom(entity);
      await this._entities[entity.entityId].onUpdate();
    } else {
      // Cloning so we make sure that history is not impacted
      this._entities[entity.entityId] = entity.clone();
      await this._entities[entity.entityId].onInitialize();
    }
  }

  public unregisterEntity(entity: PlaskEntity) {
    if (!this._entities[entity.entityId]) {
      console.warn('Trying to unregister a non-registered entity');
      return;
    }

    delete this._entities[entity.entityId];
    entity.onDispose();
  }

  public serializeAll() {
    // ! This requires that ALL our entities are serializable
    const result = {} as { [key: string]: PlaskEntitySpec };
    return JSON.stringify(Object.keys(this.entities).map((key) => (result[key] = this.entities[key].serialize())));
  }

  public unserializeAll(spec: PlaskSpec) {
    for (const key in spec) {
      const entitySpec = spec[key];
      let entity: Nullable<PlaskEntity> = null;
      switch (entitySpec.className) {
        case 'PlaskTransformNode':
          entity = PlaskTransformNode.Unserialize(entitySpec as PlaskTransformNodeSpec);
          break;
        default:
          console.warn('unknown entity spec, file version may differ from app version');
          break;
      }
      if (entity) {
        this.registerEntity(entity);
      }
    }
  }
}
