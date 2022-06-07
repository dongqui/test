import {
  Scene,
  Mesh,
  PlaneDragGizmo,
  TransformNode,
  CreateSphere,
  Vector3,
  Quaternion,
  Color3,
  StandardMaterial,
  UtilityLayerRenderer,
  CreateBox,
  CreatePlane,
  CreateIcoSphere,
  ActionManager,
  ActionEvent,
  ExecuteCodeAction,
} from '@babylonjs/core';

export class ScreenPlaneDragGizmo extends PlaneDragGizmo {
  constructor(scene: Scene, dragPlaneNormal: Vector3, color: Color3 = Color3.Gray(), gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer, parent = null) {
    super(dragPlaneNormal, color, gizmoLayer, parent);

    // const scene = gizmoLayer.utilityLayerScene;

    // let centerMesh: Mesh = CreateSphere('centerMesh', { diameter: 0.015 }, gizmoLayer.utilityLayerScene);
    let centerMesh: Mesh = CreateBox('centerMesh', { size: 0.02 }, gizmoLayer.utilityLayerScene);
    // let centerMesh: Mesh = CreatePlane('centerMesh', gizmoLayer.utilityLayerScene);
    var unlit = new StandardMaterial('M_centerMesh', gizmoLayer.utilityLayerScene);
    unlit.disableLighting = true;
    unlit.emissiveColor = new Color3(1, 1, 1);
    centerMesh.material = unlit;

    // TODO change mat while hover
    // let actionManager = centerMesh.actionManager ?? new ActionManager(gizmoLayer.utilityLayerScene);
    // actionManager.registerAction(
    //   new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (event: ActionEvent) => {
    //     let mat = centerMesh.material as StandardMaterial;
    //     mat.emissiveColor = new Color3(1, 1, 0);
    //   }),
    // );

    // actionManager.registerAction(
    //   new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, (event: ActionEvent) => {
    //     let mat = centerMesh.material as StandardMaterial;
    //     mat.emissiveColor = new Color3(1, 1, 1);
    //   }),
    // );
    this.setCustomMesh(centerMesh);

    // this.dragBehavior.onDragStartObservable.add(() => {
    //   const cam = scene.activeCamera;
    //   if (!cam) return;

    //   const F = cam.getDirection(new Vector3(0, 0, 1));
    //   // centerMesh.lookAt(F);
    //   this.dragBehavior.options.dragPlaneNormal?.copyFrom(F);
    // });
  }
}
