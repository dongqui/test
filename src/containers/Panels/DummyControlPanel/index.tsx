import { FunctionComponent, memo, useCallback } from 'react';
import _ from 'lodash';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import { checkIsTargetMesh, createDummyAnimation } from 'utils/RP';
import { AnimationIngredient, ShootTrack } from 'types/common';
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

const DEFAULT_CONTROLLER_COLOR = BABYLON.Color3.FromHexString('#FFE480');

const ControlPanel: FunctionComponent = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const retargetMaps = useSelector((state) => state.animationData.retargetMaps);

  const dispatch = useDispatch();

  const makeMeshesVisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, meshes } = asset;

        // mesh visible
        meshes.forEach((mesh) => {
          if (mesh.getScene().uid === targetScene.id) {
            mesh.isVisible = true;
          }
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
        const { id: assetId, meshes, bones } = asset;

        // bone이 invisible 하다면 joint는 visible
        const jointTransformNodes = selectableObjects.filter(
          (object) => object.getClassName() === 'TransformNode' && object.id.includes(assetId),
        );
        const jointTransformNode = jointTransformNodes[1];
        if (jointTransformNode) {
          const joint = targetScene.scene.getMeshByID(
            jointTransformNode.id.replace('transformNode', 'joint'),
          );
          if (joint && !joint.isVisible) {
            return;
          }
        }

        // mesh visible
        meshes.forEach((mesh) => {
          if (mesh.getScene().uid === targetScene.id) {
            mesh.isVisible = false;
          }
        });
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

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
        const { id: assetId, meshes } = asset;

        // mesh가 invisible 하다면 bone은 visible
        if (!meshes[0].isVisible) {
          return;
        }

        // joint invisible
        const jointTransformNodes = selectableObjects.filter(
          (object) => object.getClassName() === 'TransformNode' && object.id.includes(assetId),
        );
        jointTransformNodes.forEach((jointTransformNode) => {
          const joint = targetScene.scene.getMeshByID(
            jointTransformNode.id.replace('transformNode', 'joint'),
          );
          // Object자체 선택이 가능하도록 Armature transformNode에 대해서는 visible off를 허용하지 않음
          if (joint && !joint.id.toLowerCase().includes('armature')) {
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

  const makeControllersVisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId } = asset;

        // controller visible
        const controllers = selectableObjects.filter(
          (object) => object.id.split('//')[0] === assetId && object.getClassName() === 'Mesh',
        );
        controllers.forEach((controller) => {
          // type guard
          if (checkIsTargetMesh(controller) && controller.getScene().uid === targetScene.id) {
            controller.isVisible = true;
          }
        });
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

  const makeControllersInvisible = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId } = asset;

        // controller invisible
        const controllers = selectableObjects.filter(
          (object) => object.id.split('//')[0] === assetId && object.getClassName() === 'Mesh',
        );
        controllers.forEach((controller) => {
          // type guard
          if (checkIsTargetMesh(controller) && controller.getScene().uid === targetScene.id) {
            controller.isVisible = false;
          }
        });
      });
    }
  }, [assetList, sceneList, selectableObjects, selectedTargets]);

  const addControllers = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = _.uniq(selectedTargets.map((target) => target.id.split('//')[0]));

    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, bones } = asset;

        if (
          // 이미 해당 asset에 대한 controller가 존재한다면 생성하지 않음
          selectableObjects.find(
            (object) => object.id.split('//')[0] === assetId && object.getClassName() === 'Mesh',
          )
        ) {
          return;
        }

        const targetRetargetMap = retargetMaps.find(
          (retargetMap) => retargetMap.assetId === assetId,
        );

        if (targetRetargetMap) {
          // if (
          //   // retargetMap이 완성되지 않은 경우에는 생성하지 않음
          //   // retargetMap 생성 로직 완료 후에는 주석 해제해야 함
          //   Object.keys(targetRetargetMap.value).length !==
          //   Object.values(targetRetargetMap.value).filter((v) => v.targetBoneId).length
          // ) {
          //   return;
          // }

          // 컨트롤러 생성
          const controllers: BABYLON.Mesh[] = [];
          // prettier-ignore
          const targetBoneIndices = [1, 56, 61, 2, 57, 62, 3, 58, 63, 4, 59, 64, 5, 8, 32, 6, 9, 33, 10, 34, 11, 35, 16, 40]; // retargetMap의 values 대신 사용
          const controllerMaterial = new BABYLON.StandardMaterial(
            'controllerMaterial',
            targetScene.scene,
          );
          controllerMaterial.emissiveColor = DEFAULT_CONTROLLER_COLOR;
          controllerMaterial.disableLighting = true;

          bones.forEach((bone, idx) => {
            if (targetBoneIndices.includes(idx)) {
              const controller = BABYLON.MeshBuilder.CreateTorus(
                `${bone.name}_controller`,
                {
                  diameter: 40,
                  thickness: 0.2,
                  tessellation: 64,
                },
                targetScene.scene,
              );
              controller.renderingGroupId = 3;
              controller.id = `${assetId}//${bone.name}//controller`;
              controller.material = controllerMaterial;

              if (controllers.length === 0) {
                // controller들의 scale을 모델에 맞추기 위해, Armature bone을 hips controller의 parent로 설정
                controller.setParent(bone.getParent());
              }

              // controller actionManager 생성 및 pick, hover action 등록
              controller.actionManager = new BABYLON.ActionManager(targetScene.scene);
              controller.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (event) => {
                  dispatch(selectingDataActions.defaultSingleSelect({ target: controller }));
                }),
              );

              controller.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                  BABYLON.ActionManager.OnPointerOverTrigger,
                  (event) => {
                    targetScene.scene.hoverCursor = 'pointer';
                  },
                ),
              );

              controller.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                  BABYLON.ActionManager.OnPointerOverTrigger,
                  (event) => {
                    targetScene.scene.hoverCursor = 'default';
                  },
                ),
              );

              controllers.push(controller);
            }
          });

          // 컨트롤러 간 계층구조 생성
          controllers.forEach((controller, idx) => {
            const targetBone = bones.find(
              (bone) => bone.id === controller.id.replace('controller', 'bone'),
            );

            if (targetBone && targetBone.children.length > 0) {
              targetBone.children.forEach((childBone) => {
                const childController = controllers.find(
                  (ctrl) => ctrl.id === childBone.id.replace('bone', 'controller'),
                );
                if (childController) {
                  childController.setParent(controller);
                }
              });
            }
            if (targetBone) {
              targetBone.computeWorldMatrix(true);
              controller.scaling = new BABYLON.Vector3(1, 1, 1);
              controller.position = targetBone.position;
            }
          });

          // dragBox selectable 대상으로 추가
          dispatch(selectingDataActions.addSelectableObjects({ objects: controllers }));

          // 컨트롤러 애니메이션 추가 - 모든 layer에서 transformNode가 가진 트랙을 그대로 복사
          const currentAnimationIngredient = animationIngredients.find(
            (anim) => anim.assetId === assetId && anim.current,
          );
          if (currentAnimationIngredient) {
            const { id, name, tracks, layers } = currentAnimationIngredient;

            const newTracks: ShootTrack[] = [];

            controllers.forEach((controller) => {
              // rotationQuaternion으로 회전법 바꾸는 처리
              controller.rotate(BABYLON.Axis.X, 0);

              // 대응하는 transformNode의 애니메이션을 사용해 controller의 애니메이션 생성 및 animationIngredient에 추가
              layers.forEach((layer) => {
                const transformNodeTracks = tracks.filter(
                  (t) =>
                    t.targetId === controller.id.replace('controller', 'transformNode') &&
                    t.layerId === layer.id,
                );
                transformNodeTracks.forEach((transformNodeTrack) => {
                  const newTrack: ShootTrack = {
                    id: uuidv4(),
                    targetId: controller.id,
                    layerId: layer.id,
                    name: `${transformNodeTrack.name}|controller`,
                    property: transformNodeTrack.property,
                    target: controller,
                    transformKeys: [...transformNodeTrack.transformKeys],
                    interpolationType: transformNodeTrack.interpolationType,
                    bezierParams: transformNodeTrack.bezierParams,
                    isMocapAnimation: transformNodeTrack.isMocapAnimation,
                    useFilter: transformNodeTrack.useFilter,
                    filterBeta: transformNodeTrack.filterBeta,
                    filterMinCutoff: transformNodeTrack.filterMinCutoff,
                    isIncluded: transformNodeTrack.isIncluded,
                    isLocked: transformNodeTrack.isLocked,
                  };
                  newTracks.push(newTrack);
                });
              });
            });

            const newAnimationIngredient: AnimationIngredient = {
              id,
              name,
              assetId,
              current: true,
              tracks: [...tracks, ...newTracks],
              layers,
            };

            dispatch(
              animationDataActions.editAnimationIngredient({
                animationIngredient: newAnimationIngredient,
              }),
            );
          }
        }
      });
    }
  }, [
    animationIngredients,
    assetList,
    dispatch,
    retargetMaps,
    sceneList,
    selectableObjects,
    selectedTargets,
  ]);

  const deleteControllers = useCallback(() => {
    const targetScene = sceneList[0];
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetScene && targetAssets) {
      targetAssets.forEach((asset) => {
        const { id: assetId, bones } = asset;

        // controller 제거
        const controllers = selectableObjects.filter(
          (object) => object.id.split('//')[0] === assetId && object.getClassName() === 'Mesh',
        );
        controllers.forEach((controller) => {
          controller.dispose();
        });

        // dragBox selectable 대상에서 제거
        dispatch(selectingDataActions.removeSelectableControllers({ assetId }));

        // 컨트롤러 애니메이션 제거
        const currentAnimationIngredient = animationIngredients.find(
          (anim) => anim.assetId === assetId && anim.current,
        );
        if (currentAnimationIngredient) {
          const { id, name, tracks, layers } = currentAnimationIngredient;

          const newAnimationIngredient: AnimationIngredient = {
            id,
            name,
            assetId,
            current: true,
            tracks: tracks.filter((track) => track.target.getClassName() !== 'Mesh'),
            layers,
          };

          dispatch(
            animationDataActions.editAnimationIngredient({
              animationIngredient: newAnimationIngredient,
            }),
          );
        }
      });
    }
  }, [animationIngredients, assetList, dispatch, sceneList, selectableObjects, selectedTargets]);

  const addJsonAnimation = useCallback(async () => {
    const selectedAssetIds = selectedTargets.map((target) => target.id.split('//')[0]);
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    if (targetAssets[0]) {
      const newAnim = await createDummyAnimation(targetAssets[0]);
      dispatch(animationDataActions.addAnimationIngredient({ animationIngredient: newAnim }));
    }
  }, [assetList, dispatch, selectedTargets]);

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
      <button className={cx('button')} onClick={addJsonAnimation}>
        Add Json Animation
      </button>
    </div>
  );
};

export default memo(ControlPanel);
