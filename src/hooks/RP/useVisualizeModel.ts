import * as BABYLON from '@babylonjs/core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as selectingDataActions from 'actions/selectingDataAction';

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
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const assetList = useSelector((state) => state.shootProject.assetList);
  const assetIdToRender = useSelector((state) => state.shootProject.assetIdToRender);
  const assetIdToUnrender = useSelector((state) => state.shootProject.assetIdToUnrender);

  const selectableObjects = useSelector((state) => state.selectingData.selectableObjects);

  const dispatch = useDispatch();

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
          retargetMap,
        } = targetAsset;

        sceneList.forEach((shootScene) => {
          const { id: sceneId, name: sceneName, scene } = shootScene;
          if (scene.isReady()) {
            // scene들에 mesh 추가
            meshes.forEach((mesh) => {
              scene.addMesh(mesh);
            });

            // scene들에 geometry 추가
            geometries.forEach((geometry) => {
              scene.addGeometry(geometry);
            });

            // scene들에 skeleton 추가
            scene.addSkeleton(skeleton);

            const jointTransformNodes: BABYLON.TransformNode[] = [];

            // joints 생성 및 scene들에 추가
            bones.forEach((bone) => {
              if (!bone.name.toLowerCase().includes('scene')) {
                const joint = BABYLON.MeshBuilder.CreateSphere(
                  `${bone.name}_joint`,
                  { diameter: 3 },
                  scene,
                );
                joint.id = `${assetId}//${bone.name}//joint`;
                joint.renderingGroupId = 3;
                joint.attachToBone(bone, meshes[0]);

                const targetTransformNode = bone.getTransformNode();
                if (targetTransformNode) {
                  jointTransformNodes.push(targetTransformNode);
                }

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
                            selectingDataActions.ctrlKeySingleSelect({
                              target: targetTransformNode,
                            }),
                          );
                        } else {
                          dispatch(
                            selectingDataActions.defaultSingleSelect({
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
                  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
                    scene.hoverCursor = 'pointer';
                  }),
                );
                joint.actionManager.registerAction(
                  new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, () => {
                    scene.hoverCursor = 'default';
                  }),
                );
              }
            });

            // dragBox 선택 대상에 추가
            dispatch(selectingDataActions.addSelectableObjects({ objects: jointTransformNodes }));

            // scene들에 skeletonViewer 추가
            const skeletonViewer = new BABYLON.SkeletonViewer(
              skeleton,
              meshes[0],
              scene,
              true,
              meshes[0].renderingGroupId,
              DEFAULT_SKELETON_VIEWER_OPTION,
            );
            skeletonViewer.mesh.id = `${assetId}//skeletonViewer`;
            scene.addMesh(skeletonViewer.mesh);

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

  // unrender 시 scene에서 지우는 작업
  useEffect(() => {
    if (assetIdToUnrender && sceneList.length > 0 && assetList.length > 0) {
      const targetAsset = assetList.find((asset) => asset.id === assetIdToUnrender);

      if (targetAsset) {
        const { id: assetId, meshes, geometries, skeleton, transformNodes } = targetAsset;

        sceneList.forEach((shootScene) => {
          const { id: sceneId, name: sceneName, scene } = shootScene;
          if (scene.isReady()) {
            // scene들에서 mesh 삭제
            meshes.forEach((mesh) => {
              scene.removeMesh(mesh);
            });

            // scene들에서 geometry 삭제
            geometries.forEach((geometry) => {
              scene.removeGeometry(geometry);
            });

            // scene들에서 skeleton 삭제
            scene.removeSkeleton(skeleton);
            // scene들에서 skeletonViewer 삭제(remove로는 삭제가 되지 않아 dispose 처리했습니다.)
            const skeletonViewerMesh = scene.getMeshByID(`${assetId}//skeletonViewer`);
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
            const jointTransformNodes = selectableObjects.filter(
              (object) => object.getClassName() === 'TransformNode' && object.id.includes(assetId),
            );
            jointTransformNodes.forEach((jointTransformNode) => {
              const joint = scene.getMeshByID(
                jointTransformNode.id.replace('transformNode', 'joint'),
              );
              if (joint) {
                scene.removeMesh(joint);
              }
            });

            // scene들에서 controllers 삭제
            const controllers = selectableObjects.filter(
              (object) => object.getClassName() === 'Mesh' && object.id.includes(assetId),
            );
            if (controllers.length > 0) {
              controllers.forEach((controller) => {
                scene.removeMesh(controller as BABYLON.Mesh);
              });
            }

            // scene들에서 transformNode 삭제
            transformNodes.forEach((transformNode) => {
              scene.removeTransformNode(transformNode);
            });
          }
        });
      }
    }
  }, [assetIdToUnrender, assetList, dispatch, sceneList, selectableObjects]);

  // unrender시 데이터 선택 대상에서 제외하는 작업
  useEffect(() => {
    if (assetIdToUnrender && assetList.length > 0) {
      // joint와 연결된 transformNode들을 dragBox 선택 대상에서 제외
      dispatch(selectingDataActions.removeSelectableControllers({ assetId: assetIdToUnrender }));
      // controller들을 dragBox 선택 대상에서 제외
      dispatch(selectingDataActions.removeSelectableJoints({ assetId: assetIdToUnrender }));
    }
  }, [assetIdToUnrender, assetList.length, dispatch]);
};

export default useVisualizeModel;
