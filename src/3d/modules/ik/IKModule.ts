import { TransformNode, BoneIKController, Color3, GizmoManager, Mesh, MeshBuilder, Nullable, Space, StandardMaterial, Vector3, AbstractMesh } from '@babylonjs/core';
import { Bone } from '@babylonjs/core/Bones/bone';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

type BoneIKParams = {
  name: string;
  controllerSize: number;
  initialPosition: Vector3;
};
export class IKModule extends Module {
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _ikControllers: BoneIKController[] = [];
  private _ikControllerMeshes: Mesh[] = [];
  private _activeIkControllers: BoneIKController[] = [];
  private _gizmoManager!: GizmoManager;

  private get _allTransformNodes() {
    return this.plaskEngine.selectorModule.allTransformNodes;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
    this._gizmoManager = new GizmoManager(this.plaskEngine.scene);
    this._gizmoManager.usePointerToAttachGizmos = false;
    this._gizmoManager.positionGizmoEnabled = true; // position
  }

  public tick(elapsed: number) {
    for (const ikController of this._activeIkControllers) {
      ikController.update();
    }
  }

  private _onSelectionChange(objects: TransformNode[]) {
    this._activeTransformNodes = objects;
  }

  public reduxObservedStates = ['selectingData.present.allObjectsMap'];
  public onStateChanged(key: string, previousState: any) {
    // TODO : when assets module is live, use its observable
    if (key === 'selectingData.present.allObjectsMap') {
      this._playgroundCode();
    }
  }

  private _createIKControllerMesh(params: BoneIKParams, bone: Bone, transformNode: TransformNode) {
    // Creating IK Target Meshes
    // TODO : make that generic (for now really name dependent)
    const scene = this.plaskEngine.scene;
    const control = MeshBuilder.CreateTorus(
      'ctrl_' + params.name,
      {
        diameter: params.name.includes('Hand') ? params.controllerSize * 1.5 : params.controllerSize,
        thickness: 0.025,
        tessellation: 32,
      },
      scene,
    );

    control.renderingGroupId = 1;
    control.material = new StandardMaterial(control.name, scene);
    (control.material as StandardMaterial).diffuseColor = Color3.Teal();
    (control.material as StandardMaterial).emissiveColor = Color3.Teal();
    (control.material as StandardMaterial).specularColor = Color3.Teal();

    bone.getPositionToRef(Space.WORLD, transformNode, control.position);
    control.rotationQuaternion = params.name.includes('Hand')
      ? scene.getTransformNodeByName(params.name)!.absoluteRotationQuaternion
      : (scene.getTransformNodeByName(params.name)!.parent! as Mesh).absoluteRotationQuaternion;

    return control;
  }

  private _playgroundCode() {
    const ikControllers = this._ikControllers; // to store IKBoneControllers
    const scene = this.plaskEngine.scene;

    // TODO : retrieve skeleton and body
    const body = scene.getMeshByName('Body') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    // Defining bones to be used in IK
    const bonesSelection = [
      { name: 'rightFoot', controllerSize: 0.2, initialPosition: new Vector3(0, 0, 0) },
      { name: 'leftFoot', controllerSize: 0.2, initialPosition: new Vector3(0, 0, 0) },
      { name: 'rightHand', controllerSize: 0.15, initialPosition: new Vector3(0, 0, 0) },
      { name: 'leftHand', controllerSize: 0.15, initialPosition: new Vector3(0, 0, 0) }, //,
    ] as BoneIKParams[];

    let activeIkControllers: BoneIKController[] = this._activeIkControllers;

    // Creating IK controls for Limbs and Torso elements
    bonesSelection.forEach((elem) => {
      // Finding Bone
      const bone = skeleton.bones.find((bone) => bone.name.includes(elem.name));

      if (!bone) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : bone not found`);
        return;
      }
      const transformNode = scene.getTransformNodeByName(elem.name);

      if (!transformNode) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : associated transformNode not found`);
        return;
      }

      // Storing Bones Initial Position
      elem.initialPosition = transformNode.absolutePosition.clone();

      const controller = this._createIKControllerMesh(elem, bone, transformNode);
      this._ikControllerMeshes.push(controller);

      // if is Limbs
      if (elem.name.includes('Foot') || elem.name.includes('Hand')) {
        // Creating IK Controllers
        const ikCtrl = new BoneIKController(transformNode, bone, {
          targetMesh: controller,
          poleAngle: 0, //elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
        });
        ikControllers.push(ikCtrl);
      }
    });

    // Starting IK movement
    // TODO : link to GizmoModule
    const gizmoManager = this._gizmoManager;

    gizmoManager.gizmos.positionGizmo!.onDragStartObservable.add(() => {
      if (pickedIkCtrl) {
        // Storing IK Controller to being updated
        activeIkControllers.push(ikControllers.find((ctrl) => ctrl.targetMesh === pickedIkCtrl) as BoneIKController);
      }
    });

    // Ending IK movement
    gizmoManager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
      if (pickedIkCtrl) {
        // Releasing IK Controller of being updated
        activeIkControllers.length = 0;
      }
    });

    let pickedIkCtrl: Nullable<Mesh> = null;

    // let bonesSelectionElem: Nullable<BoneIKParams> = null;
    let pickedBone = null;
    let pickedTrans = null;

    // Evaluating the pick of red spheres to enable IK on related bones
    this.plaskEngine.onPickObservable.add((pickedMesh) => {
      if (pickedIkCtrl) {
        pickedIkCtrl.renderOutline = false;
      }
      gizmoManager.attachToNode(null);
      if (this._ikControllerMeshes.includes(pickedMesh)) {
        pickedIkCtrl = pickedMesh;
        pickedIkCtrl.renderOutline = true;
        pickedIkCtrl.outlineColor = Color3.White();
        pickedIkCtrl.outlineWidth = 0.01;

        // bonesSelectionElem = bonesSelection.find((elem) => elem.name.slice(9) == pickedMesh.name.slice(5)) || null;
        // TODO : associate bone/ikcontroller in the map
        pickedBone = scene.getBoneByName(pickedMesh.name.slice(5))!.name;
        pickedTrans = scene.getTransformNodeByName(pickedMesh.name.slice(5));

        gizmoManager.attachToMesh(pickedMesh);
      }
    });
  }
}
