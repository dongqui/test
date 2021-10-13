import { FunctionComponent, memo, useCallback } from 'react';
import _ from 'lodash';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_SKELETON_VIEWER_OPTION = {
  pauseAnimations: false,
  returnToRest: false,
  computeBonesUsingShaders: true,
  useAllBones: true, // error with false
  displayMode: BABYLON.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
  displayOptions: {
    sphereBaseSize: 0.01,
    sphereScaleUnit: 15,
    sphereFactor: 0.9,
    midStep: 0.25,
    midStepFactor: 0.05,
  },
};

const ControlPanel: FunctionComponent = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const selectedTargets = useSelector((state) => state.selectingData.selectedTargets);

  const makeMeshesVisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, meshes } = asset;

        // mesh visible
        meshes.forEach((mesh) => {
          mesh.isVisible = true;
        });
      });
    }
  }, [assetList, sceneList, selectedTargets]);

  const makeMeshesInvisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, meshes } = asset;

        // mesh visible
        meshes.forEach((mesh) => {
          mesh.isVisible = false;
        });
      });
    }
  }, [assetList, sceneList, selectedTargets]);

  const makeBonesVisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, meshes, skeleton } = asset;

        // joint visible
        const jointTransformNodes = selectableObjects.filter(
          (object) => object.getClassName() === 'TransformNode' && object.id.includes(assetId),
        );
        jointTransformNodes.forEach((jointTransformNode) => {
          const joint = targetScene.scene.getMeshByID(
            jointTransformNode.id.replace('transformNode', 'joint'),
          );
          if (joint) {
            joint.isVisible = true;
          }
        });

        // create skeletonView
        const skeletonViewer = new BABYLON.SkeletonViewer(
          skeleton,
          meshes[0],
          targetScene.scene,
          true,
          meshes[0].renderingGroupId,
          DEFAULT_SKELETON_VIEWER_OPTION,
        );
        skeletonViewer.mesh.id = `${assetId}//skeletonViewer`;
        targetScene.scene.addMesh(skeletonViewer.mesh);
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

  const makeBonesInvisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId } = asset;

        // joint invisible
        const jointTransformNodes = selectableObjects.filter(
          (object) => object.getClassName() === 'TransformNode' && object.id.includes(assetId),
        );
        jointTransformNodes.forEach((jointTransformNode) => {
          const joint = targetScene.scene.getMeshByID(
            jointTransformNode.id.replace('transformNode', 'joint'),
          );
          if (joint) {
            joint.isVisible = false;
          }
        });

        // skeletonView dispose
        const skeletonViewerMesh = targetScene.scene.getMeshByID(`${assetId}//skeletonViewer`);
        if (skeletonViewerMesh) {
          targetScene.scene.removeMesh(skeletonViewerMesh);
          const skeletonViewerChildMesh = skeletonViewerMesh
            .getChildMeshes()
            .find((m) => m.id === 'skeletonViewer_merged');
          if (skeletonViewerChildMesh) {
            skeletonViewerChildMesh.dispose();
          }
        }
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

  const makeControllersVisible = useCallback(() => {}, []);

  const makeControllersInvisible = useCallback(() => {}, []);

  const addControllers = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, meshes } = asset;

        if (
          // 이미 해당 asset에 대한 controller가 존재한다면 생성하지 않음
          selectableObjects.find(
            (object) => object.id.split('//')[0] === assetId && object.getClassName() === 'Mesh',
          )
        ) {
          return;
        }

        // 컨트롤러 생성

        // 컨트롤러 애니메이션 추가
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

  const deleteControllers = useCallback(() => {}, []);

  return (
    <div className={cx('wrapper')}>
      <button className={cx('button')} onClick={makeMeshesVisible}>
        Meshes Visible
      </button>
      <button className={cx('button')} onClick={makeMeshesInvisible}>
        Meshes Invisible
      </button>
      <button className={cx('button')} onClick={makeBonesVisible}>
        Bones Visible
      </button>
      <button className={cx('button')} onClick={makeBonesInvisible}>
        Bones Invisible
      </button>
      <button className={cx('button')} onClick={makeControllersVisible}>
        Controller Visible
      </button>
      <button className={cx('button')} onClick={makeControllersInvisible}>
        Controller Invisible
      </button>
      <button className={cx('button')} onClick={addControllers}>
        Add Controllers
      </button>
      <button className={cx('button')} onClick={deleteControllers}>
        Delete Controllers
      </button>
    </div>
  );
};

export default memo(ControlPanel);
