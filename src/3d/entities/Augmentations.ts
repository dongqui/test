import { PlaskEngine } from "3d/PlaskEngine";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { PlaskEntity } from "./PlaskEntity";
import { PlaskTransformNode } from "./PlaskTransformNode";

declare module '@babylonjs/core' {
  export interface TransformNode {
    getPlaskEntity(): PlaskTransformNode;
  }
}

TransformNode.prototype.getPlaskEntity = function() {
  const engine = PlaskEngine.GetInstance();
  if (!engine) {
    throw new Error('Engine is not yet initialized, cannot get entity');
  }
  if (this.metadata.__plaskEntityId) {
    return engine.getEntity(this.metadata.__plaskEntityId) as PlaskTransformNode;
  }
  // Entity id is not yet cached, we must search all entities to match ids
  const result = engine.getEntitiesByPredicate((entity) => entity.name === 'TransformNode' && (entity as PlaskTransformNode).id === this.id);
  if (!result[0]) {
    throw new Error('Cannot find entity.')
  }

  return result[0] as PlaskTransformNode;
}