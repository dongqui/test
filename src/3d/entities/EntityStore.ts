import { Scene } from '@babylonjs/core';
import { PlaskEntity } from './PlaskEntity';
import { PlaskTransformNode } from './PlaskTransformNode';

export class EntityStore {
  private _entities: { [id: string]: PlaskEntity } = {};

  constructor(public scene: Scene) {}

  /**
   * Main function to associate serialized entities to references on the 3D scene
   * @param entity
   */
  public getReference(entity: PlaskEntity) {
    let reference: any = null;
    switch (entity.name) {
      case 'TransformNode':
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

  public serialize() {
    // pass
  }

  public unserialize() {
    // pass
  }
}
