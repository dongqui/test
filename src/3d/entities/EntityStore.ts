import { Nullable, Scene } from '@babylonjs/core';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';
import { PlaskTransformNode, PlaskTransformNodeSpec } from './PlaskTransformNode';

// TODO : move this
export type PlaskSpec = {
  [key: string]: PlaskEntitySpec;
};

export class EntityStore {
  private _entities: { [id: string]: PlaskEntity } = {};
  public get entities() {
    return this._entities;
  }

  constructor(public scene: Scene) {
    // TODO : remove debug
    (window as any).debugSerialize = () => console.log(this.serializeAll());
  }

  /**
   * Main function to associate serialized entities to references on the 3D scene
   * @param entity
   */
  public getReference(entity: PlaskEntity) {
    let reference: any = null;
    switch (entity.className) {
      case 'PlaskTransformNode':
        const typedEntity = entity as PlaskTransformNode;
        if (typedEntity.type === 'joint') {
          reference = this.scene.getTransformNodeById(typedEntity.id);
        } else if (typedEntity.type === 'controller') {
          reference = this.scene.getMeshById(typedEntity.id);
        }
        break;
      default:
        break;
    }
    return reference;
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

  public registerEntity(entity: PlaskEntity) {
    if (this._entities[entity.entityId]) {
      this._entities[entity.entityId].copyFrom(entity);
      this._entities[entity.entityId].unserialize();
    } else {
      this._entities[entity.entityId] = entity;
    }
  }

  public serializeAll() {
    // ! This requires that ALL our entities are serializable
    const result = {} as { [key: string]: PlaskEntitySpec };
    return JSON.stringify(Object.keys(this.entities).map((key) => (result[key] = this.entities[key].serialize())));
  }

  public unserialize(spec: PlaskSpec) {
    for (const key in spec) {
      const entitySpec = spec[key];
      let entity: Nullable<PlaskEntity> = null;
      switch (entitySpec.className) {
        case 'PlaskTransformNode':
          entity = PlaskTransformNode.Parse(entitySpec as PlaskTransformNodeSpec);
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
