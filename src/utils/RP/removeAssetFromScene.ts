import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { Mesh, Scene } from '@babylonjs/core';
import { PlaskAsset } from 'types/common';

const removeAssetFromScene = (scene: Scene, asset: PlaskAsset, joints: Mesh[], controllers: PlaskTransformNode[]) => {
  const { id: assetId, meshes, geometries, skeleton, transformNodes } = asset;

  meshes.forEach((mesh) => {
    scene.removeMesh(mesh);
  });

  geometries.forEach((geometry) => {
    scene.removeGeometry(geometry);
  });

  scene.removeSkeleton(skeleton);
  // scene들에서 skeletonViewer 삭제(remove로는 삭제가 되지 않아 dispose 처리했습니다.)
  const skeletonViewerMesh = scene.getMeshById(`${assetId}//skeletonViewer`);
  if (skeletonViewerMesh) {
    scene.removeMesh(skeletonViewerMesh);
    const skeletonViewerChildMesh = skeletonViewerMesh.getChildMeshes().find((m) => m.id === 'skeletonViewer_merged');
    if (skeletonViewerChildMesh) {
      skeletonViewerChildMesh.dispose();
    }
  }

  joints.forEach((joint) => {
    scene.removeMesh(joint);
  });

  controllers.forEach((controller) => {
    scene.removeMesh(controller.reference as Mesh);
  });

  transformNodes.forEach((transformNode) => {
    scene.removeTransformNode(transformNode);
  });
};

export default removeAssetFromScene;
