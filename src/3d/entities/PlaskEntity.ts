import { PlaskEngine } from '3d/PlaskEngine';
import { v4 } from 'uuid';
import './Augmentations';

export class PlaskEntity {
  constructor(existingEntity?: PlaskEntity) {
    this.entityId = existingEntity ? existingEntity.entityId : v4();
    this.name = existingEntity ? existingEntity.name : 'GenericEntity';
  }
  public entityId: string;
  public name: string;

  public clone() {
    const newEntity = new PlaskEntity(this);

    return newEntity;
  }
  // public serialize() {
  //   // TODO
  // }
  // public static Parse() {
  //   // TODO
  // }
}
