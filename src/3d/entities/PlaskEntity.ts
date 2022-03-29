import { PlaskEngine } from '3d/PlaskEngine';
import { v4 } from 'uuid';
import './Augmentations';

export abstract class PlaskEntity {
  constructor(entityId?: string) {
    this.entityId = entityId || v4();
    this.name = 'GenericEntity';
  }
  /**
   * These should never change
   */
  public readonly entityId: string;
  public readonly name: string;

  public abstract copyFrom(other: PlaskEntity): PlaskEntity;
  public abstract unserialize(): void;
  public abstract clone(): PlaskEntity;

  // public serialize() {
  //   // TODO
  // }
  // public static Parse() {
  //   // TODO
  // }
}
