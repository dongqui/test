/* eslint-disable prettier/prettier */
import {
  TransformNode,
  BoneIKController,
  Color3,
  GizmoManager,
  Mesh,
  MeshBuilder,
  Nullable,
  Space,
  StandardMaterial,
  Vector3,
  AbstractMesh,
  Quaternion,
  Tools,
  Matrix,
  Skeleton,
  Scalar,
} from '@babylonjs/core';
import { Bone } from '@babylonjs/core/Bones/bone';
import { 
  AdvancedDynamicTexture,
  StackPanel,
  Control,
  TextBlock,
  Slider,
} from '@babylonjs/gui';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

type BoneIKParams = {
  name: string;
  controllerSize: number;
  initialPosition: Vector3;
  poleAngle: number;
};
export class IKModule extends Module {
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _ikControllers: BoneIKController[] = [];
  private _ikControllerMeshes: Mesh[] = [];
  private _activeIkControllers: BoneIKController[] = [];
  private _gizmoManager!: GizmoManager;
  private _advancedTexture!: AdvancedDynamicTexture;

  private get _allTransformNodes() {
    return this.plaskEngine.selectorModule.allTransformNodes;
  }

  public get retargetMap() {
    const assetId = this.plaskEngine.state.plaskProject.visualizedAssetIds[0];
    const map = this.plaskEngine.state.animationData.retargetMaps.find((elt) => elt.assetId === assetId);

    if (map) {
      return map;
    }

    return null;
  }

  public dispose() {
    this.plaskEngine.selectorModule.onSelectionChangeObservable.remove(this._selectionChangeObserver);
  }

  public initialize() {
    this._selectionChangeObserver = this.plaskEngine.selectorModule.onSelectionChangeObservable.add((objects) => this._onSelectionChange(objects));
    this._gizmoManager = new GizmoManager(this.plaskEngine.scene);
    this._gizmoManager.usePointerToAttachGizmos = false;
    this._gizmoManager.positionGizmoEnabled = true; // position
    this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');
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
    params.initialPosition = control.position;
    //control.rotationQuaternion = transformNode.absoluteRotationQuaternion;
    // eslint-disable-next-line prettier/prettier
    control.rotationQuaternion = params.name.includes('Hand')
    ? transformNode.absoluteRotationQuaternion
    : transformNode.parent.absoluteRotationQuaternion;

    // TODO : make this a child class instead of storing in metadata
    // Or make a map that link ikctrlmesh / bone / transformNode
    control.metadata = control.metadata || {};
    control.metadata.__transformNode = transformNode;
    control.metadata.__bone = bone;

    return control;
  }

  private _createGUIElement(pickedIkCtrl: Nullable<Mesh> = null) {

    const advancedTexture = this._advancedTexture;

    const activeIKControllers = this._activeIkControllers;

    // IK PANELS ///////////////////////////////////////////////////////////////////
    const slidePanel = new StackPanel();
    slidePanel.width = "220px";
    slidePanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    slidePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(slidePanel);
    //slidePanel.isVisible = false;

    const header_Title = new TextBlock();
    header_Title.text = "IK ADJUSTS";
    header_Title.height = "30px";
    header_Title.color = "white";
    slidePanel.addControl(header_Title); 

    // Pole Angles Title
    const header_PoleAngle = new TextBlock();
    header_PoleAngle.text = "Pole Angle: 90 deg";
    header_PoleAngle.height = "30px";
    header_PoleAngle.color = "white";
    slidePanel.addControl(header_PoleAngle); 

    const slider_PoleAngle = new Slider();
    slider_PoleAngle.minimum = -Math.PI/2;
    slider_PoleAngle.maximum = Math.PI/2;
    slider_PoleAngle.value = 0;
    slider_PoleAngle.height = "20px";
    slider_PoleAngle.width = "200px";
    slider_PoleAngle.background = "teal";
    slider_PoleAngle.onValueChangedObservable.add(function(value) {
        header_PoleAngle.text = "Pole Angle: " + (Tools.ToDegrees(value) | 0) + " deg";

        if (pickedIkCtrl) {
            /*
            IK_keyframes.forEach(key => {
                // Evaluate if there is a keyframe at actual timeline position
                if (key[0] == slider_Keyframe.value.toFixed(0)){                                
                    key.forEach((val, idx, arr) => {
                        if (arr[idx] == pickedIkCtrl.name){
                            // Update Keyframe
                            arr[idx+6] = value;

                            // Update IK Control
                            ikCtrls.find(ctrl => ctrl.targetMesh == pickedIkCtrl).poleAngle = value;
                            ikCtrls.find(ctrl => ctrl.targetMesh == pickedIkCtrl).update();
                        }
                    });
                }
            })
            */
           let ikController = activeIKControllers.find((ctrl) => ctrl.targetMesh === pickedIkCtrl);

           if (ikController)
            ikController.poleAngle = value;
        }
    });
    slidePanel.addControl(slider_PoleAngle);

    // Blend Title
    const header_Blend = new TextBlock();
    header_Blend.text = "Blend: 1";
    header_Blend.height = "30px";
    header_Blend.color = "white";
    slidePanel.addControl(header_Blend); 

    // Blend Slider
    const slider_Blend = new Slider();
    slider_Blend.minimum = 0;
    slider_Blend.maximum = 1;
    slider_Blend.value = 1;
    slider_Blend.height = "20px";
    slider_Blend.width = "200px";
    //slider_Blend.isVisible = false;
    slider_Blend.background = "teal";
    slider_Blend.onValueChangedObservable.add(function(value) {
        header_Blend.text = "FK / IK Blend: " + value.toFixed(1);

        // Evaluate if a IK Controller is selected
        if (pickedIkCtrl) {
          /*
          IK_keyframes.forEach(key => {
              // Evaluate if there is a keyframe at actual timeline position
              if (key[0] == slider_Keyframe.value.toFixed(0)){
                  key.forEach((val, idx, arr) => {
                      if (arr[idx] == pickedIkCtrl.name){
                          console.log(idx);
                          
                          // Update Keyframe
                          arr[idx+5] = value;

                          // Blend between FK (original) position and IK position
                          pickedIkCtrl.absolutePosition.x = 
                              Scalar.Lerp(
                                  arr[idx+4].x,
                                  arr[idx+1].x,
                                  value
                          );
                          pickedIkCtrl.absolutePosition.y = 
                              Scalar.Lerp(
                                  arr[idx+4].y,
                                  arr[idx+1].y,
                                  value
                          );
                          pickedIkCtrl.absolutePosition.z = 
                              Scalar.Lerp(
                                  arr[idx+4].z,
                                  arr[idx+1].z,
                                  value
                          );                        
                          // Update IK Control
                          ikCtrls.find(ctrl => ctrl.targetMesh == pickedIkCtrl).update();                        
                          // Blend between TEAL and WHITE colors
                          pickedIkCtrl.material.emissiveColor.r =
                              Scalar.Lerp(
                                  Color3.White().r,
                                  Color3.Teal().r,
                                  value
                          );
                          pickedIkCtrl.material.emissiveColor.g =
                              Scalar.Lerp(
                                  Color3.White().g,
                                  Color3.Teal().g,
                                  value
                          );
                          pickedIkCtrl.material.emissiveColor.b =
                              Scalar.Lerp(
                                  Color3.White().b,
                                  Color3.Teal().b,
                                  value
                          );
                      }
                  });
              }
          });
          */
         /*
          // Blend between FK (original) position and IK position
          pickedIkCtrl.absolutePosition.x = 
              Scalar.Lerp(
                  arr[idx+4].x,
                  arr[idx+1].x,
                  value
          );
          pickedIkCtrl.absolutePosition.y = 
              Scalar.Lerp(
                  arr[idx+4].y,
                  arr[idx+1].y,
                  value
          );
          pickedIkCtrl.absolutePosition.z = 
              Scalar.Lerp(
                  arr[idx+4].z,
                  arr[idx+1].z,
                  value
          );                        
          // Update IK Control
          activeIKControllers.find((ctrl) => ctrl.targetMesh === pickedIkCtrl)?.update();

          // Blend between TEAL and WHITE colors
          pickedIkCtrl.material.emissiveColor.r =
              Scalar.Lerp(
                  Color3.White().r,
                  Color3.Teal().r,
                  value
          );
          pickedIkCtrl.material.emissiveColor.g =
              Scalar.Lerp(
                  Color3.White().g,
                  Color3.Teal().g,
                  value
          );
          pickedIkCtrl.material.emissiveColor.b =
              Scalar.Lerp(
                  Color3.White().b,
                  Color3.Teal().b,
                  value
          );
          */
        }
    });
    slidePanel.addControl(slider_Blend);
  }

  private _playgroundCode() {
    const ikControllers = this._ikControllers; // to store IKBoneControllers
    const scene = this.plaskEngine.scene;

    // TODO : retrieve skeleton and body
    //const body = scene.getMeshByName('Body') as Mesh; // store body mesh
    const body = scene.getMeshByName('__root__') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton
    /*
    if (skeleton.name === 'Armature') {
      // This show Mannequin model Matrix
      const mannequin = [
        { name: 'leftArm' },
        { name: 'leftForeArm' },
        { name: 'leftHand' },
        { name: 'leftUpLeg' },
        { name: 'leftLeg' },
        { name: 'leftFoot' },
        { name: 'rightArm' },
        { name: 'rightForeArm' },
        { name: 'rightHand' },
        { name: 'rightUpLeg' },
        { name: 'rightLeg' },
        { name: 'rightFoot' },
      ];

      mannequin.forEach((elem) => {
        let pos = new Vector3();
        let rot = new Quaternion();
        let sca = new Vector3();
        let mtx = new Matrix();

        let tr = scene.getTransformNodeByName(elem.name) || undefined;
        let bn = scene.getBoneByName(elem.name);

        //console.log(bn?.getRotation(2, tr));
        //console.log(bn?.getDirection(new Vector3(0, 0, 1), tr));

        console.log(bn?.getRotationQuaternion(0, tr));
        console.log(bn?.getBaseMatrix());
        //bn?.setAxisAngle(new Vector3(0, 0, 1), 2 * Math.PI, 0, tr);
        //bn?.setRotation(new Vector3(0, 0, -180), 2, tr);
        //bn?.setRotationQuaternion(new Quaternion(0, 0, -Math.PI), 2, tr);
        //bn?.setYawPitchRoll(0, 0, -Math.PI, 0, tr);

        console.log(bn?.getRotationQuaternion(0, tr));

        //bn?.computeWorldMatrix(true);
        //bn?.computeAbsoluteTransforms();
        //bn?.getWorldMatrix().decompose(sca, rot, pos);
        //console.table(elem.name, rot);

        //console.log(tr?.rotationQuaternion);
        //tr?.addRotation(0, 0, -180);
        //console.log(tr?.rotationQuaternion);

        //tr?.setDirection(new Vector3(0, 0, 1), undefined, undefined, -Math.PI);
        //tr?.rotate(new Vector3(0, 0, 1), -180);

        //tr?.computeWorldMatrix(true);

        //tr?.getWorldMatrix().decompose(sca, rot, pos);
        //tr?.getPoseMatrix().decompose(sca, rot, pos);
        //console.table(elem.name, rot);
      });
    } else if (skeleton.name === 'Xbot') {
      // This show Xbot model Matrix
      const xbot = [
        { name: 'LeftArm' },
        { name: 'LeftForeArm' },
        { name: 'LeftHand' },
        { name: 'LeftUpLeg' },
        { name: 'LeftLeg' },
        { name: 'LeftFoot' },
        { name: 'RightArm' },
        { name: 'RightForeArm' },
        { name: 'RightHand' },
        { name: 'RightUpLeg' },
        { name: 'RightLeg' },
        { name: 'RightFoot' },
      ];

      xbot.forEach((elem) => {
        let pos = new Vector3();
        let rot = new Quaternion();
        let sca = new Vector3();
        let mtx = new Matrix();

        let bn = scene.getBoneByName('mixamorig:' + elem.name);
        // bn?.getWorldMatrix().decompose(sca, rot, pos);
        // console.table(elem.name, rot);

        let tr = scene.getTransformNodeByName('mixamorig:' + elem.name) || undefined;
        //tr?.getWorldMatrix().decompose(sca, rot, pos);
        //tr?.getPoseMatrix().decompose(sca, rot, pos);
        //console.table(elem.name, rot);

        console.log(bn?.getRotation(2, tr));
      });
    }
    */
    // Defining bones to be used in IK
    const bonesSelection = [
      { name: 'rightFoot', controllerSize: 0.2, initialPosition: new Vector3(0, 0, 0), poleAngle: -Math.PI / 2 },
      { name: 'leftFoot', controllerSize: 0.2, initialPosition: new Vector3(0, 0, 0), poleAngle: Math.PI / 2 },
      { name: 'rightHand', controllerSize: 0.15, initialPosition: new Vector3(0, 0, 0), poleAngle: 0 },
      { name: 'leftHand', controllerSize: 0.15, initialPosition: new Vector3(0, 0, 0), poleAngle: 0 },
    ] as BoneIKParams[];

    let activeIkControllers: BoneIKController[] = this._activeIkControllers;

    // Creating IK controls for Limbs and Torso elements
    bonesSelection.forEach((elem) => {
      // Finding Bone
      if (!this.retargetMap) {
        console.warn('Cannot find retarget map');
        return;
      }
      const retargetValue = this.retargetMap.values.find((elt) => elt.sourceBoneName.includes(elem.name));
      if (!retargetValue) {
        console.warn('Cannot find bone name, check boneSelection');
        return;
      }
      //console.log(this.retargetMap);

      const boneName = retargetValue.sourceBoneName;
      const transformNode = this.plaskEngine.scene.getTransformNodeById(retargetValue.targetTransformNodeId!);
      const bone = skeleton.bones.find((bone) => bone.getTransformNode() === transformNode);

      //console.log(transformNode, bone);

      if (!bone) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : bone not found`);
        return;
      }

      if (!transformNode) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : associated transformNode not found`);
        return;
      }

      // Storing Bones Initial Position
      elem.initialPosition = transformNode.absolutePosition.clone();

      const controller = this._createIKControllerMesh(elem, bone, transformNode);
      this._ikControllerMeshes.push(controller);

      console.log(elem);

      // if is Limbs
      //if (elem.name.includes('Foot') || elem.name.includes('Hand')) {
      // Creating IK Controllers
      //const ikCtrl = new BoneIKController(transformNode, bone, {
      const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex()], {
        //const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex() - 1], {
        targetMesh: controller,
        //poleAngle: 0, //elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
        poleAngle: elem.poleAngle,
      });
      ikControllers.push(ikCtrl);
      //}
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

        pickedBone = pickedIkCtrl.metadata.__bone;
        pickedTrans = pickedIkCtrl.metadata.__transformNode;

        gizmoManager.attachToMesh(pickedMesh);
      }
    });

    this._createGUIElement(pickedIkCtrl);
  }
}
