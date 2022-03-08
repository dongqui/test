import { PlaskEngine } from '3d/PlaskEngine';
import { v4 } from 'uuid';

export class PlaskEntity {
  constructor() {
    if (PlaskEngine.GetInstance()) {
      PlaskEngine.GetInstance().addEntity(this);
    }
  }
  public entityId = v4();
  public name = 'GenericEntity';
  // public serialize() {
  //   // TODO
  // }
  // public static Parse() {
  //   // TODO
  // }
}
