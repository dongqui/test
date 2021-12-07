import * as BABYLON from '@babylonjs/core';

const filterAnimatableTransformNodes = (transformNodes: BABYLON.TransformNode[]) => {
  return transformNodes.filter(
    (transformNode) =>
      !transformNode.name.toLowerCase().includes('camera') &&
      !transformNode.name.toLowerCase().includes('scene') &&
      !transformNode.name.toLowerCase().includes('armature') &&
      !transformNode.name.toLowerCase().includes('light'),
  );
};

export default filterAnimatableTransformNodes;
