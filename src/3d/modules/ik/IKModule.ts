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
  AssetContainer,
} from '@babylonjs/core';
import { Bone } from '@babylonjs/core/Bones/bone';
import { 
  AdvancedDynamicTexture,
  StackPanel,
  Control,
  TextBlock,
  Slider,
  Button
} from '@babylonjs/gui';
import { Module } from '../Module';
import { SelectorModule } from '../selector/SelectorModule';

type BoneIKParams = {
  name: string;
  controllerSize: number;
  poleAngle: number;
  parent_1: string;
  parent_2: string;
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
  private _blendSlider: Slider = new Slider();
  private _poleAngleSlider: Slider = new Slider();
  private _ikMeshes: Mesh[] = [];

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
    this._advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI', undefined, this.plaskEngine.scene);
  }

  public tick(elapsed: number) {
    //if (this._pickedIkMesh)
    //  this._pickedIkMesh.metadata.ikController.update();
    for (const ikController of this._activeIkControllers) {
    //for (const ikController of this._ikControllers) {
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
      if (this._ikControllers.length === 0)
        this._playgroundCode();
    }
  }

  private _createIKControllerMesh(params: BoneIKParams, bone: Bone, transformNode: TransformNode) {
    // Creating IK Target Meshes
    // TODO : make that generic (for now really name dependent)
    const scene = this.plaskEngine.scene;
    const controller = MeshBuilder.CreateTorus(
      'ctrl_' + params.name,
      {
        diameter: params.name.includes('Hand') ? params.controllerSize * 1.5 : params.controllerSize,
        thickness: 0.025,
        tessellation: 32,
      },
      scene,
    );

    controller.renderingGroupId = 1;
    controller.material = new StandardMaterial(controller.name, scene);
    (controller.material as StandardMaterial).diffuseColor = Color3.Teal();
    (controller.material as StandardMaterial).emissiveColor = Color3.Teal();
    (controller.material as StandardMaterial).specularColor = Color3.Teal();

    bone.getPositionToRef(Space.WORLD, transformNode, controller.position);
    // eslint-disable-next-line prettier/prettier
    // TRICK to adjust Foot Controllers rotation to Leg instead of Foot 
    controller.rotationQuaternion = params.name.includes('Hand')
    ? transformNode.absoluteRotationQuaternion
    : (transformNode.parent as Mesh).absoluteRotationQuaternion;

    // TODO : make this a child class instead of storing in metadata
    // Or make a map that link ikctrlmesh / bone / transformNode
    // Clone addition
    const controllerClone = controller.clone('cln_'+controller.name);
    controllerClone.metadata = {
      boneName: bone.name,
      boneIndex: bone.getIndex(),
      boneId: bone.id,
      transformNode: bone.getTransformNode(),
      transformNode_1: scene.getTransformNodeByName(params.parent_1),
      transformNode_2: scene.getTransformNodeByName(params.parent_2),
      transformNodeClone: scene.getTransformNodeByName('Clone of '+bone.name),
      controller: controller,
      ikController: undefined,
      controllerOrig: undefined,
      ikControllerOrig: undefined,
      blend: 1,
    };
    controller.setParent(controllerClone);
    controller.isVisible = false;
    controller.isPickable = false;

    return {controller, controllerClone};
  }

  private _createGUIElement() {

    const advancedTexture = this._advancedTexture;
    const scene = this.plaskEngine.scene;

    // IK PANELS ///////////////////////////////////////////////////////////////////
    // Show/Hide Button
    const button_SH = Button.CreateSimpleButton("but_IKtoFK", "IK Show/Hide");
    button_SH.width = "200px";
    button_SH.height = "30px";
    button_SH.left = "300px";
    button_SH.top = "-250px";
    button_SH.color = "teal";
    button_SH.background = "white";
    button_SH.paddingTop = "5px";
    button_SH.onPointerClickObservable.add(() => {
      slidePanel.isVisible = !slidePanel.isVisible;
      if (slidePanel.isVisible){
        button_SH.color = "teal";
        button_SH.background = "white";    
        this._ikMeshes.forEach(elem => {
          elem.isVisible = true;
        });
        if (this._pickedIkMesh) {
          this._gizmoManager.attachToNode(this._pickedIkMesh);
        }
      } else {
        button_SH.color = "white";
        button_SH.background = "teal";    
        this._ikMeshes.forEach(elem => {
          elem.isVisible = false;
        });
        this._gizmoManager.attachToNode(null);
      }
    });
    advancedTexture.addControl(button_SH);

    const slidePanel = new StackPanel();
    slidePanel.width = "220px";
    slidePanel.left = "300px";
    slidePanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
    //slidePanel.isVisible = false;
    advancedTexture.addControl(slidePanel);

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
            this._pickedIkMesh.metadata.ikController.poleAngle = value;
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
    slider_Blend.background = "teal";
    slider_Blend.onValueChangedObservable.add((value) => {
        header_Blend.text = "FK / IK Blend: " + value.toFixed(1);

        // Evaluate if a IK Controller is selected
        if (this._pickedIkMesh) {
          let newPos = new Vector3();
          Vector3.LerpToRef(
            this._pickedIkMesh.metadata.transformNodeClone.absolutePosition,
            this._pickedIkMesh.absolutePosition,
              value,
              newPos
          );
          this._pickedIkMesh.metadata.controller.setAbsolutePosition(newPos);
          this._pickedIkMesh.metadata.blend = value;

          let newColor = new Color3();
          let newMat = new StandardMaterial("", scene);
          // Blend between TEAL and WHITE colors
          Color3.LerpToRef(
              Color3.White(),
              Color3.Teal(),
              value,
              newColor
          );
          newMat.emissiveColor = newColor;
          this._pickedIkMesh.material = newMat;
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

      let finger_1 = scene.transformNodes.find((el) => el.name.includes(elem.name_1)) as TransformNode;
      let finger_2 = scene.transformNodes.find((el) => el.name.includes(elem.name_2)) as TransformNode;
      let finger_3: TransformNode;
      if (elem.name_3)
        finger_3 = scene.transformNodes.find((el) => el.name.includes(elem.name_3)) as TransformNode;

      slider_finger.onValueChangedObservable.add(function(value) {          
        if (finger_1) {
          if (!finger_1.name.includes('Thumb')) {
            finger_1.rotationQuaternion.x = value;
          } else if (finger_1.name.includes('Left')){
            finger_1.rotationQuaternion.z = -value;
          } else 
            finger_1.rotationQuaternion.z = value;
        }

        if (finger_2) {
         if (!finger_2.name.includes('Thumb')) {
            finger_2.rotationQuaternion.x = value;
          } else {
            finger_2.rotationQuaternion.x = -value;
          }
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

    // FK to IK Button
    const button_FK_IK = Button.CreateSimpleButton("but_FKtoIK", "Set FK to IK");
    button_FK_IK.width = "200px";
    button_FK_IK.height = "30px";
    button_FK_IK.color = "white";
    button_FK_IK.background = "teal";
    button_FK_IK.paddingTop = "5px";
    button_FK_IK.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        let controller = this._pickedIkMesh.metadata.controller;
        let controllerOrig = this._pickedIkMesh.metadata.controllerOrig;
        controllerOrig.setAbsolutePosition(controller.absolutePosition);
        let ikcontrollerOrig = this._pickedIkMesh.metadata.ikControllerOrig;
        ikcontrollerOrig.poleAngle = this._pickedIkMesh.metadata.ikController.poleAngle;
        ikcontrollerOrig.update();
      }
    });
    slidePanel.addControl(button_FK_IK);

    // IK to FK Button
    const button_IK_FK = Button.CreateSimpleButton("but_IKtoFK", "Set IK to FK");
    button_IK_FK.width = "200px";
    button_IK_FK.height = "30px";
    button_IK_FK.color = "white";
    button_IK_FK.background = "teal";
    button_IK_FK.paddingTop = "5px";
    button_IK_FK.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        this._gizmoManager.attachToNode(null);
        let transfNodeClone = this._pickedIkMesh.metadata.transformNodeClone;
        this._pickedIkMesh.setAbsolutePosition(transfNodeClone.absolutePosition);
        let ikcontroller = this._pickedIkMesh.metadata.ikController;
        ikcontroller.poleAngle = this._pickedIkMesh.metadata.ikControllerOrig.poleAngle;
        ikcontroller.update();
        this._gizmoManager.attachToNode(this._pickedIkMesh);
      }
    });
    slidePanel.addControl(button_IK_FK);

    // Bake
    const button_Bake = Button.CreateSimpleButton("but_Bake", "Set Bake");
    button_Bake.width = "200px";
    button_Bake.height = "30px";
    button_Bake.color = "white";
    button_Bake.background = "teal";
    button_Bake.paddingTop = "5px";
    button_Bake.onPointerClickObservable.add(() => {
      // Evaluate if a IK Controller is selected
      if (this._pickedIkMesh) {
        //console.log(this.plaskEngine.state.keyframes);
        //console.log(this.plaskEngine.state.trackList.selectedLayer);
        console.log(this.plaskEngine.state.selectingData.present.selectedTargets);
        // console.log(this.plaskEngine.state.trackList.propertyTrackList);
        // console.log(this.plaskEngine.state.animationData.animationIngredients);
        // console.log(this.plaskEngine.state.animatingControls.currentTimeIndex);    
      }
    });
    slidePanel.addControl(button_Bake);
  }

  // public get assetList() {
  //   return this.plaskEngine.state.plaskProject.assetList;
  // }

  // public get currentVisualizedAssetId() {
  //   return this.visualizedAssetIds[0];
  // }

  // public get visualizedAssetIds() {
  //   return this.plaskEngine.state.plaskProject.visualizedAssetIds;
  // }

  private _playgroundCode() {
    const ikControllers = this._ikControllers; // to store IKBoneControllers
    const scene = this.plaskEngine.scene;

    //console.log(this.plaskEngine.state.plaskProject.assetList);
    //console.log(this.plaskEngine.state.animationData);
    //console.log(this.plaskEngine.state.keyframes);

    //const targetAsset = this.assetList.find((asset) => asset.id === this.currentVisualizedAssetId);
    // if (targetAsset) {
    //   const { meshes, geometries, skeleton, bones, transformNodes } = targetAsset;
    //   container.meshes = meshes;
    //   container.geometries = geometries;
    //   container.skeletons[0] = skeleton;
    //   container.skeletons[0].bones = bones;
    //   container.transformNodes = transformNodes;
    // }

    // Container created to generate the Clone of Character
    const container = new AssetContainer(scene);
    container.meshes = scene.meshes;
    container.geometries = scene.geometries;
    container.skeletons = scene.skeletons;
    container.transformNodes = scene.transformNodes;
    const clone = container.instantiateModelsToScene();
    scene.onReadyObservable.addOnce(() => {
      // Adjusting transparency of the Cloned meshes    
      scene.meshes.forEach(m => {
        if (m.name.includes('Clone of')){
          m.visibility = 0.25;
          this._ikMeshes.push(m);
        }
      })
    })
    const bodyClone = scene.getMeshByName('Clone of __root__') as Mesh;
    const skeletonClone = scene.skeletons[1];

    this._createGUIElement();

    // TODO : retrieve skeleton and body
    //const body = scene.getMeshByName('Body') as Mesh; // store body mesh
    const body = scene.getMeshByName('__root__') as Mesh; // store body mesh
    const skeleton = scene.skeletons[0]; // store skeleton

    // Defining bones to be used in IK
    const bonesSelection = [
      { name: 'rightFoot', controllerSize: 0.2, poleAngle: -Math.PI / 2, parent_1: 'rightLeg', parent_2: 'rightUpLeg' },
      { name: 'leftFoot', controllerSize: 0.2,  poleAngle: Math.PI / 2, parent_1: 'leftLeg', parent_2: 'leftUpLeg' },
      { name: 'rightHand', controllerSize: 0.15, poleAngle: 0, parent_1: 'rightForeArm', parent_2: 'rightArm'},
      { name: 'leftHand', controllerSize: 0.15, poleAngle: 0, parent_1: 'leftForeArm', parent_2: 'leftArm'},
    ] as BoneIKParams[];

    //let activeIkControllers: BoneIKController[] = this._activeIkControllers;

    // Creating IK controls
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
      const transformNode = this.plaskEngine.scene.getTransformNodeById(retargetValue.targetTransformNodeId!);
      const bone = skeleton.bones.find((bone) => bone.getTransformNode() === transformNode);

      if (!bone) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : bone not found`);
        return;
      }

      if (!transformNode) {
        console.warn(`Cannot insert IK controller on bone ${elem.name} : associated transformNode not found`);
        return;
      }

      const {controller, controllerClone} = this._createIKControllerMesh(elem, bone, transformNode);
      this._ikControllerMeshes.push(controllerClone);
      this._ikMeshes.push(controllerClone);

      // Creating IK Controllers
      //const ikCtrl = new BoneIKController(transformNode, bone, {
      //const ikCtrl = new BoneIKController(body, bone, {
      //const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex() - 1], {
      const ikCtrl = new BoneIKController(body, skeleton.bones[bone.getIndex()], {
        targetMesh: controller,
        //poleAngle: 0, //elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
        poleAngle: elem.poleAngle,
      });
      ikControllers.push(ikCtrl);

      controllerClone.metadata.ikController = ikCtrl;

      const controllerOrig = MeshBuilder.CreateBox('orig_' + elem.name, { size: 2 }, scene);
      controllerOrig.isVisible = false;
      const ikCtrlClone = new BoneIKController(bodyClone, skeletonClone.bones[bone.getIndex()], {
        targetMesh: controllerOrig,
        //poleAngle: 0, //elem.name.includes('Hand') ? 0 : elem.name.includes('Left') ? Math.PI / 2 : -Math.PI / 2,
        poleAngle: elem.poleAngle,
      });
      //ikControllers.push(ikCtrlClone);

      controllerClone.metadata.controllerOrig = controllerOrig;
      controllerClone.metadata.ikControllerOrig = ikCtrlClone;
    });

    // Starting IK movement
    // TODO : link to GizmoModule
    const gizmoManager = this._gizmoManager;
    /*
    gizmoManager.gizmos.positionGizmo!.onDragStartObservable.add(() => {
      if (pickedIkCtrl) {
        // Storing IK Controller to being updated
        this._activeIkControllers.push(ikControllers.find((ctrl) => ctrl.targetMesh === pickedIkCtrl) as BoneIKController);
      }
    });

    // Ending IK movement
    gizmoManager.gizmos.positionGizmo!.onDragEndObservable.add(() => {
      if (pickedIkCtrl) {
        // Releasing IK Controller of being updated
        this._activeIkControllers.length = 0;
      }
    });
    */
    let pickedIkCtrl: Nullable<Mesh> = null;

    // Evaluating the pick of blue torus to enable IK on related bones
    this.plaskEngine.onPickObservable.add((pickedMesh) => {
      if (pickedIkCtrl) {
        pickedIkCtrl.renderOutline = false;
      }
      gizmoManager.attachToNode(null);
      this._activeTransformNodes.length = 0;
      this._activeIkControllers.length = 0;
      if (this._ikControllerMeshes.includes(pickedMesh)) {
        pickedIkCtrl = pickedMesh;
        pickedIkCtrl.renderOutline = true;
        pickedIkCtrl.outlineColor = Color3.White();
        pickedIkCtrl.outlineWidth = 0.01;

        gizmoManager.attachToMesh(pickedMesh);

        this._activeIkControllers.push(pickedIkCtrl.metadata.ikController);

        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode);
        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode_1);
        this._activeTransformNodes.push(pickedIkCtrl.metadata.transformNode_2);

        //console.log(this._activeTransformNodes);

        this._pickedIkMesh = pickedIkCtrl;
        this._blendSlider.value = pickedIkCtrl.metadata.blend;
        this._poleAngleSlider.value = pickedIkCtrl.metadata.ikController.poleAngle;
      }
      //console.log(pickedIkCtrl?.metadata);
    });
  }
}