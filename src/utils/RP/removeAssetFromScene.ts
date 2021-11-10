import * as BABYLON from '@babylonjs/core';
import { ShootAsset } from 'types/common';

const removeAssetFromScene = (scene: BABYLON.Scene, asset: ShootAsset, jointTransformNodes: BABYLON.TransformNode[], controllers: BABYLON.Mesh[]) => {
  const { id: assetId, meshes, geometries, skeleton, transformNodes } = asset;

  // scene들에서 mesh 삭제
  meshes.forEach((mesh) => {
    scene.removeMesh(mesh);
  });

  // scene들에서 geometry 삭제
  geometries.forEach((geometry) => {
    scene.removeGeometry(geometry);
  });

  // scene들에서 skeleton 삭제
  scene.removeSkeleton(skeleton);
  // scene들에서 skeletonViewer 삭제(remove로는 삭제가 되지 않아 dispose 처리했습니다.)
  const skeletonViewerMesh = scene.getMeshByID(`${assetId}//skeletonViewer`);
  if (skeletonViewerMesh) {
    scene.removeMesh(skeletonViewerMesh);
    const skeletonViewerChildMesh = skeletonViewerMesh.getChildMeshes().find((m) => m.id === 'skeletonViewer_merged');
    if (skeletonViewerChildMesh) {
      skeletonViewerChildMesh.dispose();
    }
  }

  // scene들에서 joints 삭제
  jointTransformNodes.forEach((jointTransformNode) => {
    const joint = scene.getMeshByID(jointTransformNode.id.replace('transformNode', 'joint'));
    if (joint) {
      scene.removeMesh(joint);
    }
  });

  // scene들에서 controllers 삭제
  controllers.forEach((controller) => {
    scene.removeMesh(controller as BABYLON.Mesh);
  });

  // scene들에서 transformNode 삭제
  transformNodes.forEach((transformNode) => {
    scene.removeTransformNode(transformNode);
  });
};

export default removeAssetFromScene;
