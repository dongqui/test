import { TransformNode } from '@babylonjs/core';

export function addMetadata(key: string, value: any, transformNode: TransformNode) {
  if (!transformNode.metadata) {
    transformNode.metadata = { plask: {} };
  }
  if (!transformNode.metadata.plask) {
    transformNode.metadata.plask = {};
  }
  transformNode.metadata.plask[key] = value;
}

export function readMetadata(key: string, transformNode: TransformNode) {
  if (transformNode.metadata && transformNode.metadata.plask) {
    return transformNode.metadata.plask[key];
  }
}
