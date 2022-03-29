import { PlaskEngine } from '3d/PlaskEngine';
import { v4 } from 'uuid';
import './Augmentations';

export type PlaskEntitySpec = {
  entityId: string;
  className: string;
};
export abstract class PlaskEntity {
  constructor(entityId?: string) {
    this.entityId = entityId || v4();
  }
  /**
   * This should never change
   */
  public readonly entityId: string;
  public abstract readonly className: string;

  public abstract copyFrom(other: PlaskEntity | PlaskEntitySpec): PlaskEntity;
  public serialize(): PlaskEntitySpec {
    return {
      entityId: this.entityId,
      className: this.className,
    };
  }
  public abstract unserialize(): void;
  public abstract clone(): PlaskEntity;

  // public serialize() {
  //   // TODO
  // }
  // public static Parse() {
  //   // TODO
  // }
}
