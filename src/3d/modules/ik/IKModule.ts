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

type FingersSliderParams = {
  name_1: string;
  name_2: string;
  name_3: string;
  height: string;
}
export class IKModule extends Module {
  private _selectionChangeObserver: ReturnType<SelectorModule['onSelectionChangeObservable']['add']> = null;
  private _activeTransformNodes: TransformNode[] = [];
  private _ikControllers: BoneIKController[] = [];
  private _ikControllerMeshes: Mesh[] = [];
  private _activeIkControllers: BoneIKController[] = [];
  private _gizmoManager!: GizmoManager;
  private _advancedTexture!: AdvancedDynamicTexture;
  private _pickedIkMesh: Mesh | undefined;
  private _pickedIkMeshClone: Mesh | undefined;
  private _ikMeshesClones: Mesh[] = [];
  private _blendSlider: Slider | undefined;
  private _poleAngleSlider: Slider | undefined;

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
    //this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', undefined, this.plaskEngine.scene);
    this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.plaskEngine.scene);
  }

  public tick(elapsed: number) {
    //for (const ikController of this._activeIkControllers) {
    for (const ikController of this._ikControllers) {
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
    : (transformNode.parent as Mesh).absoluteRotationQuaternion;

    // TODO : make this a child class instead of storing in metadata
    // Or make a map that link ikctrlmesh / bone / transformNode
    control.metadata = control.metadata || {};
    control.metadata.__transformNode = transformNode;
    control.metadata.__bone = bone;

    // Nelson's aditions
    control.metadata.__initialPosition = new Vector3(control.position.x, control.position.y, control.position.z);
    control.metadata.__poleAngle = params.poleAngle;
    control.metadata.__blend = 1;

    return control;
  }

  private _createGUIElement() {

    const advancedTexture = this._advancedTexture;
    //const activeIKControllers = this._activeIkControllers;
    const pickedIkCtrl = this._pickedIkMesh;
    const scene = this.plaskEngine.scene;
    const retargetMap = this.retargetMap;

    // IK PANELS ///////////////////////////////////////////////////////////////////
    const slidePanel = new StackPanel();
    slidePanel.width = "220px";
    slidePanel.left = "300px";
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
    slider_PoleAngle.onValueChangedObservable.add((value) => {
        header_PoleAngle.text = "Pole Angle: " + (Tools.ToDegrees(value) | 0) + " deg";

        if (this._pickedIkMesh) {
           let ikController = this._ikControllers.find((ctrl) => ctrl.targetMesh == this._pickedIkMesh)
           if (ikController)
            {
              ikController.poleAngle = value;
              console.log(ikController.poleAngle);
            }

            this._pickedIkMesh.metadata.__poleAngle = value;
        }
    });
    slidePanel.addControl(slider_PoleAngle);
    this._poleAngleSlider = slider_PoleAngle;

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
    slider_Blend.onValueChangedObservable.add((value) => {
        header_Blend.text = "FK / IK Blend: " + value.toFixed(1);

        // Evaluate if a IK Controller is selected
        if (this._pickedIkMesh && this._pickedIkMeshClone) {
          this._pickedIkMesh.isVisible = false;
          this._pickedIkMeshClone.isVisible = true;
         
          // Blend between FK (original) position and IK position
          this._pickedIkMesh.absolutePosition.x = 
              Scalar.Lerp(
                this._pickedIkMesh.metadata.__initialPosition.x,
                this._pickedIkMeshClone.position.x,
                value
          );
          this._pickedIkMesh.absolutePosition.y = 
              Scalar.Lerp(
                this._pickedIkMesh.metadata.__initialPosition.y,
                this._pickedIkMeshClone.position.y,
                value
          );
          this._pickedIkMesh.absolutePosition.z = 
              Scalar.Lerp(
                this._pickedIkMesh.metadata.__initialPosition.z,
                this._pickedIkMeshClone.position.z,
                value
          );

          if (this._pickedIkMeshClone.material) {
            // Blend between TEAL and WHITE colors
            (this._pickedIkMeshClone.material as StandardMaterial).emissiveColor.r =
                Scalar.Lerp(
                    Color3.White().r,
                    Color3.Teal().r,
                    value
            );
            (this._pickedIkMeshClone.material as StandardMaterial).emissiveColor.g =
                Scalar.Lerp(
                    Color3.White().g,
                    Color3.Teal().g,
                    value
            );
            (this._pickedIkMeshClone.material as StandardMaterial).emissiveColor.b =
                Scalar.Lerp(
                    Color3.White().b,
                    Color3.Teal().b,
                    value
            );
          }
          this._pickedIkMesh.metadata.__blend = value;
          //console.log(this._pickedIkMesh.absolutePosition, this._pickedIkMesh.metadata.__initialPosition, this._pickedIkMeshClone.position);
        }
    });
    slidePanel.addControl(slider_Blend);
    this._blendSlider = slider_Blend;

    // FINGERS CONTROLS //////////////////////////////////////////////////////////////////
    const fingersBackPanel = new StackPanel();
    fingersBackPanel.width = "220px";
    fingersBackPanel.height = '180px'
    fingersBackPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersBackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    slidePanel.addControl(fingersBackPanel);

    // Fingers Title
    const header_fingers_1 = new TextBlock();
    header_fingers_1.text = "Fingers Controls";
    header_fingers_1.height = "30px";
    header_fingers_1.color = "white";
    fingersBackPanel.addControl(header_fingers_1); 

    const fingersPanel = new StackPanel();
    fingersPanel.width = "220px";
    fingersPanel.height = '120px'
    fingersPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    fingersPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    fingersPanel.isVertical = false;
    fingersBackPanel.addControl(fingersPanel);

    const fingersSliders = [
      { name_1: 'LeftHandPinky1', name_2: 'LeftHandPinky2', name_3: 'LeftHandPinky3', height: '100px'},
      { name_1: 'LeftHandRing1', name_2: 'LeftHandRing2', name_3: 'LeftHandRing3', height: '120px'},
      { name_1: 'LeftHandMiddle1', name_2: 'LeftHandMiddle2', name_3: 'LeftHandMiddle3', height: '120px'},
      { name_1: 'LeftHandIndex1', name_2: 'LeftHandIndex2', name_3: 'LeftHandIndex3', height: '120px'},
      { name_1: 'LeftHandThumb1', name_2: 'LeftHandThumb2', name_3: null, height: '80px'},
      { name_1: 'RightHandThumb1', name_2: 'RightHandThumb2', name_3: null, height: '80px'},
      { name_1: 'RightHandIndex1', name_2: 'RightHandIndex2', name_3: 'RightHandIndex3', height: '120px'},
      { name_1: 'RightHandMiddle1', name_2: 'RightHandMiddle2', name_3: 'RightHandMiddle3', height: '120px'},
      { name_1: 'RightHandRing1', name_2: 'RightHandRing2', name_3: 'RightHandRing3', height: '120px'},
      { name_1: 'RightHandPinky1', name_2: 'RightHandPinky2', name_3: 'RightHandPinky3', height: '100px'},
    ] as FingersSliderParams[];

    fingersSliders.forEach((elem) => {
      const slider_finger = new Slider();
      slider_finger.minimum = 0;
      slider_finger.maximum = 0.5;
      slider_finger.value = 0;
      slider_finger.height = elem.height;
      slider_finger.width = "20px";
      slider_finger.paddingLeft = "2px";
      slider_finger.paddingRight = "2px";
      slider_finger.isVertical = true;
      slider_finger.background = "teal";

      //console.log(scene.transformNodes);

      let finger_1 = scene.transformNodes.find((el) => el.name.includes(elem.name_1));
      let finger_2 = scene.transformNodes.find((el) => el.name.includes(elem.name_2));
      let finger_3 = null as unknown as TransformNode;
      if (elem.name_3)
        finger_3 = scene.transformNodes.find((el) => el.name.includes(elem.name_3));

      slider_finger.onValueChangedObservable.add(function(value) {
        if (finger_1)
          if (!finger_1.name.includes('Thumb')) {
            finger_1.rotationQuaternion.x = value;
          } else if (finger_1.name.includes('Left')){
            finger_1.rotationQuaternion.z = -value;
          } else 
            finger_1.rotationQuaternion.z = value;

        if (finger_2)
          if (!finger_2.name.includes('Thumb')) {
            finger_2.rotationQuaternion.x = value;
          } else {
            finger_2.rotationQuaternion.x = -value;
          }

        if (finger_3)
          finger_3.rotationQuaternion.x = value;
      });
      fingersPanel.addControl(slider_finger);  
    });

    // Left Right text title
    const header_fingers_2 = new TextBlock();
    header_fingers_2.text = "Left              Right";
    header_fingers_2.height = "30px";
    header_fingers_2.color = "white";
    fingersBackPanel.addControl(header_fingers_2);
    
  }

  private _playgroundCode() {
    const ikControllers = this._ikControllers; // to store IKBoneControllers
    const scene = this.plaskEngine.scene;

    this._createGUIElement();

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
      this._ikMeshesClones.push(controller.clone(controller.name+'_clone'));
      console.log(this._ikMeshesClones);

      //console.log(elem);

      // Creating IK Controllers
      //const ikCtrl = new BoneIKController(transformNode, bone, {
      const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex()], {
        //const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex() - 1], {
        targetMesh: controller,
        //poleAngle: 0, //elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
        poleAngle: elem.poleAngle,
      });
      ikControllers.push(ikCtrl);
    });

    this._ikMeshesClones.forEach(elem => {
      elem.isVisible = false;
      elem.isPickable = false;
    });

    // Starting IK movement
    // TODO : link to GizmoModule
    const gizmoManager = this._gizmoManager;

    gizmoManager.gizmos.positionGizmo!.onDragStartObservable.add(() => {
      if (pickedIkCtrl) {
        //this._meshSettings
        // Storing IK Controller to being updated
        activeIkControllers.push(ikControllers.find((ctrl) => ctrl.targetMesh === pickedIkCtrl) as BoneIKController);
      }
    });

    // Ending IK movement
    gizmoManager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
      if (pickedIkCtrl && this._pickedIkMeshClone) {
        // Releasing IK Controller of being updated
        activeIkControllers.length = 0;
        // Updating PickedMeshClone position
        this._pickedIkMeshClone.position = pickedIkCtrl.position;
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

        this._pickedIkMesh = pickedIkCtrl;
        this._pickedIkMeshClone = this._ikMeshesClones.find(elem => elem.name.includes(pickedIkCtrl.name));
        //console.log(this._pickedIkMesh, this._pickedIkMeshClone);

        this._blendSlider.value = this._pickedIkMesh.metadata.__blend;
        this._poleAngleSlider.value = this._pickedIkMesh.metadata.__poleAngle;
      }
    });
  }
}