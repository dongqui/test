import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable } from '@babylonjs/core';
import { v4 } from 'uuid';
import './Augmentations';

/**
 * Type of the serialized PlaskEntity
 *
 * Child classes of PlaskEntity should provide their own serialized type
 * that derives from this type.
 */
export type PlaskEntitySpec = {
  entityId: string;
  className: string;
};

/**
 * Entities make the link between the redux state, babylon js and the serialized format of plask
 * They contain all the necessary data to save and restore the redux state and the Babylon state.
 */
export abstract class PlaskEntity {
  constructor(entityId?: string) {
    this.entityId = entityId || v4();
  }
  /**
   * Unique id of the entity
   * This should never change after the entity is created
   */
  public readonly entityId: string;
  /**
   * Class name to reinstanciate the right entity when unserializing
   */
  public abstract readonly className: string;

  /**
   * Copies data from another entity, or from an entity spec
   * @param other
   */
  public abstract copyFrom(other: PlaskEntity | PlaskEntitySpec): PlaskEntity;

  /**
   * Serializes this entity to a plain Javascript object
   *
   * @returns
   */
  public serialize(): PlaskEntitySpec {
    return {
      entityId: this.entityId,
      className: this.className,
    };
  }

  /**
   * Creates an entity from a spec object
   * Should be implemented in the child class
   * @param spec
   */
  public static Unserialize(spec: PlaskEntitySpec): PlaskEntity {
    throw new Error('Unserialize is not implemented for this entity');
  }
  /**
   * Clones this entity
   * Implementation in the child class is necessary so entities can live and be replaced by clone in the redux state
   */
  public abstract clone(): PlaskEntity;
}
