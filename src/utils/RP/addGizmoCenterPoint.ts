import { AbstractMesh, ActionManager, Gizmo, ExecuteCodeAction, Matrix, Mesh, MeshBuilder, Nullable, Scene, Vector3, VertexBuffer } from '@babylonjs/core';
import { addMetadata } from './metadata';

/**
 * Add pickable joint spheres to bones
 *
 * @param bones - bones to attach joint spheres
 * @param mesh - root mesh
 * @param scene - scene where the model is visualized
 * @param assetId - asset(model)'s id
 * @returns an array containing arrays of a jointSphere and its corresponding bone
 */
const addGizmoCenterPoint = (gizmo: Gizmo, scene: Scene, assetId: string) => {
  const sphereBoneGroups: Array<[Mesh, Gizmo]> = [];
  let longestBoneLength = Number.NEGATIVE_INFINITY;

  // bones.forEach((bone, idx) => {
  //   const boneAbsoluteBindPoseTransform = new Matrix();
  //   getAbsoluteBindPoseToRef(bone, boneAbsoluteBindPoseTransform);
  //   const anchorPoint = new Vector3();
  //   boneAbsoluteBindPoseTransform.decompose(undefined, undefined, anchorPoint);
  //   bone.children.forEach((child, childIndex) => {
  //     const childAbsoluteBindPoseTransform = new Matrix();
  //     child.getBaseMatrix().multiplyToRef(boneAbsoluteBindPoseTransform, childAbsoluteBindPoseTransform);
  //     const childPoint = new Vector3();
  //     childAbsoluteBindPoseTransform.decompose(undefined, undefined, childPoint);
  //     const distanceFromParent = Vector3.Distance(anchorPoint, childPoint);
  //     if (distanceFromParent > longestBoneLength) {
  //       longestBoneLength = distanceFromParent;
  //     }
  //   });
  //   const sphereBaseSize = 0.4;
  //   const sphere = MeshBuilder.CreateSphere(`${bone.name}_joint`, { segments: 20, diameter: sphereBaseSize, updatable: true }, scene);
  //   sphere.id = `${assetId}//${bone.name}//joint`;
  //   sphere.renderingGroupId = 2;

  //   const numVertices = sphere.getTotalVertices();
  //   const mwk = [];
  //   const mik = [];
  //   for (let i = 0; i < numVertices; i += 1) {
  //     mwk.push(1, 0, 0, 0);
  //     mik.push(bone.getIndex(), 0, 0, 0);
  //   }
  //   sphere.setVerticesData(VertexBuffer.MatricesWeightsKind, mwk, false);
  //   sphere.setVerticesData(VertexBuffer.MatricesIndicesKind, mik, false);
  //   sphere.position = anchorPoint.clone();
  //   // if (bone.name !== 'Armature') {
  //   //   addMetadata('hasTracks', true, bone.getTransformNode()!);
  //   // }
  //   sphereBoneGroups.push([sphere, bone]);
  // });

  // const sphereScaleUnit = 15;

  // sphereBoneGroups.forEach(([sphere, bone]) => {
  //   const scale = 1 / (sphereScaleUnit / longestBoneLength);
  //   sphere.scaling.scaleInPlace(scale);

  //   sphere.actionManager = new ActionManager(scene);
  //   sphere.actionManager.registerAction(
  //     new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
  //       scene.hoverCursor = 'pointer';
  //     }),
  //   );

  //   scene.onBeforeRenderObservable.add(() => {
  //     sphere.setAbsolutePosition(bone.getAbsolutePosition(mesh));
  //   });
  // });

  return sphereBoneGroups;
};

export default addGizmoCenterPoint;
