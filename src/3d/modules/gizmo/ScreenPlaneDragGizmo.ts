import { Scene, Mesh, PlaneDragGizmo, TransformNode, CreateBox, Vector3, Quaternion, Color3, StandardMaterial, UtilityLayerRenderer } from '@babylonjs/core';

export class ScreenPlaneDragGizmo extends PlaneDragGizmo {
  constructor(dragPlaneNormal: Vector3, color: Color3 = Color3.Gray(), gizmoLayer: UtilityLayerRenderer = UtilityLayerRenderer.DefaultUtilityLayer, parent = null) {
    super(dragPlaneNormal, color, gizmoLayer, parent);

    const scene = gizmoLayer.utilityLayerScene;

    let cube: Mesh = CreateBox('centerDragGizmo', { size: 0.015 }, gizmoLayer.utilityLayerScene);
    var unlit = new StandardMaterial('M_centerDragGizmo', gizmoLayer.utilityLayerScene);
    unlit.disableLighting = true;
    unlit.emissiveColor = new Color3(1, 1, 1);
    cube.material = unlit;
    this.setCustomMesh(cube);

    console.log(dragPlaneNormal);

    this.dragBehavior.onDragStartObservable.add(() => {
      const cam = scene.activeCamera;
      if (!cam) return;

      const F = cam.getDirection(new Vector3(0, 0, 1));
      // this.attachedMesh.
      this.dragBehavior.options.dragPlaneNormal?.set(F.x, F.y, F.z);
    });
  }
}
