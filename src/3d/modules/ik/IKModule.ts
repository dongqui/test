import { BoneIKController, Color3, GizmoManager, Mesh, MeshBuilder, Nullable, Space, StandardMaterial, Vector3 } from '@babylonjs/core';
import { TransformNode } from '@s/core';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

export class IKModule extends Module {
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];

  private get _allTransformNodes() {
    return this.plaskEngine.selectorModule.allTransformNodes;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
  }

  private _onSelectionChange(objects: TransformNode[]) {
    this._activeTransformNodes = objects;
  }

  private _playgroundCode() {
    const ikCtrls: BoneIKController[] = []; // to store IKBoneControllers
    const clns: Mesh[] = []; // to store cloned torus
    const scene = this.plaskEngine.scene;

    // TODO : retrieve skeleton and body
    const body = scene.meshes[1]; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    const spheres = [];
    // Creating spheres and attaching to bones for being picked and selected
    skeleton.bones.forEach((bone) => {
      //console.log(bone.name);
      if (
        !bone.name.includes('Leg') &&
        !bone.name.includes('Toe') &&
        !bone.name.includes('Arm') &&
        !bone.name.includes('Index') &&
        !bone.name.includes('Middle') &&
        !bone.name.includes('Pinky') &&
        !bone.name.includes('Ring') &&
        !bone.name.includes('Thumb')
      ) {
        const sphere = MeshBuilder.CreateSphere('slc_' + bone.name.slice(10), { segments: 4, diameter: 0.1 }, scene);
        sphere.attachToBone(bone, body);
        sphere.scaling = new Vector3(50, 50, 50);
        sphere.renderingGroupId = 2;
        sphere.material = new StandardMaterial('red', scene);
        (sphere.material as StandardMaterial).diffuseColor = Color3.Red();
        spheres.push(sphere);
      }
    });

    // Defining bones to be used in IK
    const bonesSelection = [
      { name: 'mixamorig:RightFoot', slcSz: '10', ctrlSz: '0.20', iniPosX: '0', iniPosY: '0', iniPosZ: '0' },
      { name: 'mixamorig:LeftFoot', slcSz: '10', ctrlSz: '0.20', iniPosX: '0', iniPosY: '0', iniPosZ: '0' },
      { name: 'mixamorig:RightHand', slcSz: '10', ctrlSz: '0.15', iniPosX: '0', iniPosY: '0', iniPosZ: '0' },
      { name: 'mixamorig:LeftHand', slcSz: '10', ctrlSz: '0.15', iniPosX: '0', iniPosY: '0', iniPosZ: '0' }, //,
      //{name:'mixamorig:RightToe_End', slcSz:'10', ctrlSz:'0.1'},
      //{name:'mixamorig:LeftToe_End', slcSz:'10', ctrlSz:'0.1'},
      //{name:'mixamorig:Spine', slcSz:'20', ctrlSz:'0.15'},
      //{name:'mixamorig:Neck', slcSz:'15', ctrlSz:'0.1'}
    ];
    let slc: BoneIKController[] = [];
    scene.registerBeforeRender(() => {
      // Update the Selected Limb Bone Controllers
      if (slc.length > 0) {
        slc.forEach((ctrl) => ctrl.update());
      }
    });

    // Creating IK controls for Limbs and Torso elements
    bonesSelection.forEach((elem) => {
      // Finding Bone
      const bone = skeleton.bones.find((bone) => bone.name.includes(elem.name))!;

      // Storing Bones Initial Position
      // TODO : create a map
      (elem as any).iniPosX = scene.getTransformNodeByName(elem.name)!.absolutePosition.x;
      (elem as any).iniPosY = scene.getTransformNodeByName(elem.name)!.absolutePosition.y;
      (elem as any).iniPosZ = scene.getTransformNodeByName(elem.name)!.absolutePosition.z;

      // Creating IK Target Meshes
      const control = MeshBuilder.CreateTorus(
        'ctrl_' + elem.name.slice(9),
        {
          diameter: elem.name.includes('Hand') ? +elem.ctrlSz * 1.5 : +elem.ctrlSz,
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
      bone.getPositionToRef(Space.WORLD, body, control.position);
      control.rotationQuaternion = elem.name.includes('Hand')
        ? scene.getTransformNodeByName(elem.name)!.absoluteRotationQuaternion
        : (scene.getTransformNodeByName(elem.name)!.parent! as Mesh).absoluteRotationQuaternion;

      // Creating IK Target Meshes Clone
      const ctrl_clone = control.clone('cln_' + control.name.slice(5));
      ctrl_clone.isVisible = false;
      ctrl_clone.isPickable = false;
      clns.push(ctrl_clone);

      // if is Limbs
      if (elem.name.includes('Foot') || elem.name.includes('Hand') || elem.name.includes('Toe_End')) {
        // If IS NOT Toe
        if (!elem.name.includes('Toe_End')) {
          // Creating IK Controllers
          const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex() - 1], {
            targetMesh: control,
            poleAngle: elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
          });
          ikCtrls.push(ikCtrl);
        }
      }
    });

    // Starting IK movement
    // TODO : link to GizmoModule
    const gizmoManager = (this.plaskEngine.gizmoModule as any)._gizmoManager as GizmoManager;
    gizmoManager.gizmos.positionGizmo!.onDragStartObservable.add(() => {
      if (pickedIkCtrl) {
        // Storing IK Controller to being updated
        slc.push(ikCtrls.find((ctrl) => ctrl.targetMesh === pickedIkCtrl) as BoneIKController);
      }
    });

    // Ending IK movement
    gizmoManager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
      if (pickedIkCtrl) {
        // Releasing IK Controller of being updated
        slc.length = 0;
        // Updating IK Controller Clone position
        pickedIkCtrlCln!.setAbsolutePosition(pickedIkCtrl.absolutePosition);
      }
    });

    let pickedIkCtrl: Nullable<Mesh> = null;
    let pickedIkCtrlCln: Nullable<Mesh> = null;
    let bonesSelectionElem = null;
    let pickedBone = null;
    let pickedTrans = null;
    // Evaluating the pick of red spheres to enable IK on related bones
    // TODO pointer observable
    scene.onPointerDown = () => {
      const pickInfo = scene.pick(scene.pointerX, scene.pointerY);

      if (pickedIkCtrl) pickedIkCtrl.renderOutline = false;

      gizmoManager.attachToNode(null);

      if (pickInfo && pickInfo.hit) {
        if (pickInfo.pickedMesh!.name.includes('ctrl_')) {
          if (pickedIkCtrl) {
            pickedIkCtrl.renderOutline = false;
          }

          pickedIkCtrl = pickInfo.pickedMesh as Mesh;
          pickedIkCtrl.renderOutline = true;
          pickedIkCtrl.outlineColor = Color3.White();
          pickedIkCtrl.outlineWidth = 0.01;

          pickedIkCtrlCln = clns.find((elem) => elem.name.slice(4) === pickedIkCtrl!.name.slice(5)) || null;
          console.log(pickedIkCtrl.name, pickedIkCtrlCln!.name);

          bonesSelectionElem = null;
          bonesSelectionElem = bonesSelection.find((elem) => elem.name.slice(9) == pickedIkCtrl!.name.slice(5));
          pickedBone = null;
          pickedBone = scene.getBoneByName('mixamorig' + pickInfo.pickedMesh!.name.slice(5))!.name;
          pickedTrans = scene.getTransformNodeByName('mixamorig' + pickInfo.pickedMesh!.name.slice(5));

          console.log(bonesSelectionElem!.name.slice(10));

          gizmoManager.attachToMesh(pickInfo.pickedMesh);
          gizmoManager.positionGizmoEnabled = true;
          gizmoManager.rotationGizmoEnabled = false;
        } else if (pickInfo.pickedMesh!.name.includes('slc_')) {
          console.log(pickInfo.pickedMesh!.name, scene.getTransformNodeByName('mixamorig' + pickInfo.pickedMesh!.name.slice(4)));
          gizmoManager.attachToNode(scene.getTransformNodeByName('mixamorig:' + pickInfo.pickedMesh!.name.slice(4)));
          gizmoManager.positionGizmoEnabled = false;
          gizmoManager.rotationGizmoEnabled = true;
          gizmoManager.scaleGizmoEnabled = false;

          slc = ikCtrls; // Insert all IK Controllers to Selection Array
        }
      }
    };
  }
}
