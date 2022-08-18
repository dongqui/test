import { Module } from '../Module';
import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, SkeletonViewer } from '@babylonjs/core';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import { setBoneVisibility, setGizmoVisibility, setIKControllerVisibility, setMeshVisibility } from 'actions/screenDataAction';
import { PlaskSkeletonViewer } from '3d/assets/plaskSkeletonViewer';

export class VisibilityLayersModule extends Module {
  // TODO : skeleton viewer probably doesn't belong here, we should add a skeletonViewer module
  // OR merge GizmoModule and VisibilityLayersModule under a big "OverlaysModule" that would include
  // all interactable 3D components that are not part of the final 3D render
  // (We can still split the code in several files to separate gizmo interaction and visibility)
  private _skeletonViewer: Nullable<PlaskSkeletonViewer> = null;
  public get skeletonViewer() {
    return this._skeletonViewer;
  }

  // Multi-screen not available for now, shortcut to get the main screen
  public get visibilityOptions() {
    return this.plaskEngine.state.screenData.visibilityOptions[0];
  }

  constructor(plaskEngine: PlaskEngine) {
    super(plaskEngine);
  }
  public reduxObservedStates = ['plaskProject.visualizedAssetIds'];
  public onStateChanged(key: string, previousState: any) {
    if (key === 'plaskProject.visualizedAssetIds') {
      this._updateSkeleton();
    }
  }

  private _getVisualizedAsset() {
    const assetIds = this.plaskEngine.state.plaskProject.visualizedAssetIds;
    return this.plaskEngine.state.plaskProject.assetList.find((asset) => assetIds.includes(asset.id));
  }

  private _updateSkeleton() {
    if (this._skeletonViewer) {
      this._skeletonViewer.dispose();
    }
    const visualizedAsset = this._getVisualizedAsset();
    if (visualizedAsset) {
      const { skeleton, meshes } = visualizedAsset;
      const skeletonViewer = new PlaskSkeletonViewer(skeleton, meshes[0], this.plaskEngine.scene, true, meshes[0].renderingGroupId, undefined, DEFAULT_SKELETON_VIEWER_OPTION);
      skeletonViewer.mesh.id = `${visualizedAsset.id}//skeletonViewer`;
      skeletonViewer.isEnabled = this.visibilityOptions.isBoneVisible;

      this._skeletonViewer = skeletonViewer;
    }
  }

  /**
   * Updates the visibility of 3D elements according to the visilibity options stored in the state
   * @param type
   */
  public updateVisibility(type: 'Bone' | 'Mesh' | 'Gizmo' | 'IK Controllers') {
    switch (type) {
      case 'Bone':
        const targetBoneVisibility = this.visibilityOptions.isBoneVisible;
        const visualizedBoneAsset = this._getVisualizedAsset();
        if (visualizedBoneAsset) {
          const { id: assetId, meshes, skeleton } = visualizedBoneAsset;
          // joints
          const selectableObjects = this.plaskEngine.state.selectingData.present.selectableObjects;
          const transformNodes = selectableObjects.filter((object) => object.type === 'joint' && object.id.includes(assetId)).map((entity) => entity.reference);
          transformNodes.forEach((transformNode) => {
            const joint = this.plaskEngine.scene.getMeshById(transformNode.id.replace('transformNode', 'joint'));
            if (joint) {
              joint.isVisible = targetBoneVisibility;
            }
          });
          // skeletonView
          if (this._skeletonViewer) {
            this._skeletonViewer.isEnabled = targetBoneVisibility;
          }
        }
        break;

      case 'Gizmo':
        this.plaskEngine.gizmoModule.updateVisibility();
        break;

      case 'Mesh':
        const targetMeshVisibility = this.visibilityOptions.isMeshVisible;
        const visualizedMeshAsset = this._getVisualizedAsset();
        if (visualizedMeshAsset) {
          visualizedMeshAsset.meshes.forEach((mesh) => {
            if (mesh.getScene().uid === this.plaskEngine.currentScreenId) {
              mesh.isVisible = targetMeshVisibility;
            }
          });
        }
        break;

      case 'IK Controllers':
        this.plaskEngine.dispatch(setIKControllerVisibility({ screenId: this.plaskEngine.currentScreenId, value: !this.visibilityOptions.isIKControllerVisible }));

        break;
    }
  }

  private _setTargetJointAlpha(target: string, value: number) {
    const targetBoneVisibility = this.visibilityOptions.isBoneVisible;
    const visualizedBoneAsset = this._getVisualizedAsset();
    if (visualizedBoneAsset) {
      const { id: assetId, meshes, skeleton } = visualizedBoneAsset;
      const selectableObjects = this.plaskEngine.state.selectingData.present.selectableObjects;
      const transformNodes = selectableObjects
        .filter((object) => object.type === 'joint' && object.id.includes(assetId) && object.id.toLowerCase().includes(target.toLowerCase()))
        .map((entity) => entity.reference);
      transformNodes.forEach((transformNode) => {
        const joint = this.plaskEngine.scene.getMeshById(transformNode.id.replace('transformNode', 'joint'));
        if (joint) {
          if (joint.material) {
            joint.material.alpha = value;
          }
        }
      });
    }
  }
  /**
   * Sets the blend value for the current selected controller
   * @param value
   */
  public blendSkeletonViewerLimbAlpha(value: number = 0, limbType: 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot' | string) {
    switch (limbType) {
      case 'leftHand':
        this._skeletonViewer?.blendBone('leftHand', value);
        this._skeletonViewer?.blendBone('leftForeArm', value);
        this._setTargetJointAlpha('leftHand', value);
        this._setTargetJointAlpha('leftForeArm', value);

        break;
      case 'rightHand':
        this._skeletonViewer?.blendBone('rightHand', value);
        this._skeletonViewer?.blendBone('rightForeArm', value);
        this._setTargetJointAlpha('rightHand', value);
        this._setTargetJointAlpha('rightForeArm', value);
        break;
      case 'leftFoot':
        this._skeletonViewer?.blendBone('leftFoot', value);
        this._skeletonViewer?.blendBone('leftLeg', value);
        this._skeletonViewer?.blendBone('leftToeBase', value);
        this._setTargetJointAlpha('leftFoot', value);
        this._setTargetJointAlpha('leftLeg', value);
        this._setTargetJointAlpha('leftToeBase', value);
        break;
      case 'rightFoot':
        this._skeletonViewer?.blendBone('rightFoot', value);
        this._skeletonViewer?.blendBone('rightLeg', value);
        this._skeletonViewer?.blendBone('rightToeBase', value);
        this._setTargetJointAlpha('rightFoot', value);
        this._setTargetJointAlpha('rightLeg', value);
        this._setTargetJointAlpha('rightToeBase', value);
        break;
    }
  }
}
