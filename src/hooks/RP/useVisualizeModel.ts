import * as BABYLON from '@babylonjs/core';
import { SkeletonViewer } from '@babylonjs/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as selectedTargetsActions from 'actions/selectedTargetsAction';

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

const useVisualizeModel = () => {
  const {
    sceneList,
    assetList,
    assetIdToRender,
    assetIdToUnrender,
    assetIdToRemove,
    visualizedAssetIds,
  } = useSelector((state) => state.shootProject);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   console.log('sceneList: ', sceneList);
  //   console.log('assetList: ', assetList);
  //   console.log('assetIdToRender: ', assetIdToRender);
  //   console.log('assetIdToUnrender: ', assetIdToUnrender);
  //   console.log('assetIdToRemove: ', assetIdToRemove);
  //   console.log('visualizedAssetIds: ', visualizedAssetIds);
  // }, [
  //   assetIdToRemove,
  //   assetIdToRender,
  //   assetIdToUnrender,
  //   assetList,
  //   sceneList,
  //   visualizedAssetIds,
  // ]);

  // render 작업
  useEffect(() => {
    // scene과 render할 대상이 존재하고, 현재 render된 목록에 target asset이 없을 때
    if (assetIdToRender && sceneList.length > 0 && assetList.length > 0) {
      const targetAsset = assetList.find((asset) => asset.id === assetIdToRender);

      if (targetAsset) {
        const {
          id: assetId,
          meshes,
          geometries,
          skeleton,
          bones,
          transformNodes,
          joints,
          controllers,
          animationIngredients,
          currentAnimationIngredientId,
          retargetMap,
          boneVisibleSceneIds,
          meshVisibleSceneIds,
          hasControllersSceneIds,
        } = targetAsset;

        sceneList.forEach((shootScene) => {
          const { id: sceneId, name: sceneName, scene } = shootScene;
          if (scene.isReady()) {
            if (meshVisibleSceneIds.includes(sceneId)) {
              // scene들에 mesh 추가
              meshes.forEach((mesh) => {
                scene.addMesh(mesh);
              });
            }

            // scene들에 geometry 추가
            geometries.forEach((geometry) => {
              scene.addGeometry(geometry);
            });

            // scene들에 skeleton 추가
            scene.addSkeleton(skeleton);

            if (boneVisibleSceneIds.includes(sceneId)) {
              if (joints.length === 0) {
                // joints 생성 및 scene들에 추가
                bones.forEach((bone) => {
                  if (!bone.name.toLowerCase().includes('scene')) {
                    const joint = BABYLON.MeshBuilder.CreateSphere(
                      `${bone.name}_joint`,
                      { diameter: 3 },
                      scene,
                    );
                    joint.id = `${assetId}/${bone.name}/joint`;
                    joints.push(joint); // [debug]state 내부 property를 직접 변경하는 코드
                    joint.renderingGroupId = 3;
                    joint.attachToBone(bone, meshes[0]);

                    // joint마다 actionManager 설정
                    joint.actionManager = new BABYLON.ActionManager(scene);
                    joint.actionManager.registerAction(
                      // joint 클릭으로 bone 선택하기 위한 액션
                      new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPickDownTrigger,
                        (event: BABYLON.ActionEvent) => {
                          const targetTransformNode = bone.getTransformNode();
                          if (targetTransformNode) {
                            const sourceEvent: PointerEvent = event.sourceEvent;
                            if (sourceEvent.ctrlKey || sourceEvent.metaKey) {
                              dispatch(
                                selectedTargetsActions.ctrlKeySingleSelect({
                                  target: targetTransformNode,
                                }),
                              );
                            } else {
                              dispatch(
                                selectedTargetsActions.defaultSingleSelect({
                                  target: targetTransformNode,
                                }),
                              );
                            }
                          }
                        },
                      ),
                    );
                    // joint hover 시 커서 모양 변경
                    joint.actionManager.registerAction(
                      new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPointerOverTrigger,
                        () => {
                          scene.hoverCursor = 'pointer';
                        },
                      ),
                    );
                    joint.actionManager.registerAction(
                      new BABYLON.ExecuteCodeAction(
                        BABYLON.ActionManager.OnPointerOutTrigger,
                        () => {
                          scene.hoverCursor = 'default';
                        },
                      ),
                    );
                  }
                });
              } else {
                // 이미 존재하는 joints scene들에 추가
                // state에 push 해도 되는 걸까.. 불변성이 필요 없는 값이기는 한데..
                joints.forEach((joint) => {
                  scene.addMesh(joint);
                });
              }
              // scene들에 skeletonViewer 추가
              const skeletonViewer = new SkeletonViewer(
                skeleton,
                meshes[0],
                scene,
                true,
                meshes[0].renderingGroupId,
                DEFAULT_SKELETON_VIEWER_OPTION,
              );
              skeletonViewer.mesh.id = `${assetId}/skeletonViewer`;
              scene.addMesh(skeletonViewer.mesh);
            }

            if (hasControllersSceneIds.includes(sceneId)) {
              if (controllers.length === 0) {
                //  controllers 생성 및 scene들에 추가
              } else {
                // 이미 존재하는 controllers scene들에 추가
                // animationIngredients에 controller들애니메이션 포함시키는 로직 어디서 넣을지 고민..
                controllers.forEach((controller) => {
                  scene.addMesh(controller);
                });
              }
            }

            // scene들에 애니메이션 적용을 위한 transformNode 추가
            transformNodes.forEach((transformNode) => {
              scene.addTransformNode(transformNode);
              // quaternionRotation 애니메이션을 적용하기 위한 코드
              transformNode.rotate(BABYLON.Axis.X, 0);
            });
          }
        });
      }
    }
  }, [assetIdToRender, assetList, dispatch, sceneList]);

  // unrender 작업
  useEffect(() => {
    if (assetIdToUnrender && sceneList.length > 0 && assetList.length > 0) {
      const targetAsset = assetList.find((asset) => asset.id === assetIdToUnrender);

      if (targetAsset) {
        const {
          id: assetId,
          meshes,
          geometries,
          skeleton,
          bones,
          transformNodes,
          joints,
          controllers,
          animationIngredients,
          currentAnimationIngredientId,
          retargetMap,
          boneVisibleSceneIds,
          meshVisibleSceneIds,
          hasControllersSceneIds,
        } = targetAsset;

        sceneList.forEach((shootScene) => {
          const { id: sceneId, name: sceneName, scene } = shootScene;
          if (scene.isReady()) {
            // scene들에서 mesh 삭제
            if (meshVisibleSceneIds.includes(sceneId)) {
              meshes.forEach((mesh) => {
                scene.removeMesh(mesh);
              });
            }

            // scene들에서 geometry 삭제
            geometries.forEach((geometry) => {
              scene.removeGeometry(geometry);
            });

            // scene들에서 skeleton 삭제
            scene.removeSkeleton(skeleton);
            // scene들에서 skeletonViewer 삭제(remove로는 삭제가 되지 않아 dispose 처리했습니다.)
            const skeletonViewerMesh = scene.getMeshByID(`${assetId}/skeletonViewer`);
            if (skeletonViewerMesh) {
              scene.removeMesh(skeletonViewerMesh);
              const skeletonViewerChildMesh = skeletonViewerMesh
                .getChildMeshes()
                .find((m) => m.id === 'skeletonViewer_merged');
              if (skeletonViewerChildMesh) {
                skeletonViewerChildMesh.dispose();
              }
            }

            // scene들에서 joints 삭제
            if (boneVisibleSceneIds.includes(sceneId)) {
              if (joints.length > 0) {
                joints.forEach((joint) => {
                  scene.removeMesh(joint);
                });
              }
            }

            // scene들에서 controllers 삭제
            if (hasControllersSceneIds.includes(sceneId)) {
              if (controllers.length > 0) {
                controllers.forEach((controller) => {
                  scene.removeMesh(controller);
                });
              }
            }

            // scene들에서 transformNode 삭제
            transformNodes.forEach((transformNode) => {
              scene.removeTransformNode(transformNode);
            });
          }
        });
      }
    }
  }, [assetIdToUnrender, assetList, sceneList]);
};

export default useVisualizeModel;
