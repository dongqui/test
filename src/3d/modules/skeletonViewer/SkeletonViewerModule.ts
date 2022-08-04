import { Module } from '../Module';
import { PlaskEngine } from '3d/PlaskEngine';
import { Nullable, SkeletonViewer } from '@babylonjs/core';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import { setBoneVisibility, setGizmoVisibility, setIKControllerVisibility, setMeshVisibility } from 'actions/screenDataAction';

export class SkeletonViewerModule extends Module {
  // TODO : skeleton viewer probably doesn't belong here, we should add a skeletonViewer module
  // OR merge GizmoModule and VisibilityLayersModule under a big "OverlaysModule" that would include
  // all interactable 3D components that are not part of the final 3D render
  // (We can still split the code in several files to separate gizmo interaction and visibility)
  private _skeletonViewer: Nullable<SkeletonViewer> = null;
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
      const skeletonViewer = new SkeletonViewer(skeleton, meshes[0], this.plaskEngine.scene, true, meshes[0].renderingGroupId, DEFAULT_SKELETON_VIEWER_OPTION);
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
}
