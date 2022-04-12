import { PlaskEngine } from '3d/PlaskEngine';
import { Quaternion } from '@babylonjs/core/Maths/math.vector';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { PlaskTransformNode } from './PlaskTransformNode';

declare module '@babylonjs/core' {
  export interface TransformNode {
    getPlaskEntity(): PlaskTransformNode;
  }
}

declare module '@babylonjs/core/Maths/math.vector' {
  export interface Quaternion {
    toArray(array: number[]): void;
  }
}

TransformNode.prototype.getPlaskEntity = function () {
  const engine = PlaskEngine.GetInstance();
  if (!engine) {
    throw new Error('Engine is not yet initialized, cannot get entity');
  }
  if (this.metadata.__plaskEntityId) {
    return engine.getEntity(this.metadata.__plaskEntityId) as PlaskTransformNode;
  }
  // Entity id is not yet cached, we must search all entities to match ids
  const result = engine.getEntitiesByPredicate((entity) => entity.className === 'PlaskTransformNode' && (entity as PlaskTransformNode).id === this.id);
  if (!result[0]) {
    throw new Error('Cannot find entity.');
  }

  return result[0] as PlaskTransformNode;
};

Quaternion.prototype.toArray = function (array: number[]) {
  array[0] = this.x;
  array[1] = this.y;
  array[2] = this.z;
  array[3] = this.w;
};
