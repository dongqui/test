import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as selectingDataActions from 'actions/selectingDataAction';
import { checkIsTargetMesh } from 'utils/RP';

type GizmoMode = 'position' | 'rotation' | 'scale';

const useGizmoControl = () => {
  const sceneList = useSelector((state) => state.shootProject.sceneList);
  const selectedTargets = useSelector((state) => state.selectingData.selectedTargets);

  const dispatch = useDispatch();

  const [gizmoManager, setGizmoManager] = useState<BABYLON.GizmoManager>();
  const [currentGizmoMode, setCurrentGizmoMode] = useState<GizmoMode>('position');

  useEffect(() => {
    console.log('selectedTargets: ', selectedTargets);
  }, [selectedTargets]);

  // gizmoManager 생성
  useEffect(() => {
    const baseScene = sceneList[0];
    if (baseScene && baseScene.scene) {
      const innerGizmoManager = new BABYLON.GizmoManager(baseScene.scene);

      setGizmoManager(innerGizmoManager);
      innerGizmoManager.usePointerToAttachGizmos = false;
      innerGizmoManager.positionGizmoEnabled = true; // position을 기본 모드로 설정
    }
  }, [sceneList]);

  // 선택 대상 변경에 따른 gizmo attach
  useEffect(() => {
    // 선택효과 적용
    selectedTargets.forEach((target) => {
      if (checkIsTargetMesh(target)) {
        // 컨트롤러
        target.renderOutline = true;
        target.outlineColor = BABYLON.Color3.White();
        target.outlineWidth = 0.1;
      } else {
        // joint
        const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
        if (joint) {
          joint.renderOutline = true;
          joint.outlineColor = BABYLON.Color3.White();
          joint.outlineWidth = 0.3;
        }
      }
    });

    if (gizmoManager) {
      if (selectedTargets.length === 0) {
        // 선택 해제 시
        gizmoManager.attachToNode(null);
      } else if (selectedTargets.length === 1) {
        // 단일선택 모드일 때의 gizmo 조작
        switch (currentGizmoMode) {
          // 현재 모드에 맞는 gizmo 선택
          case 'position': {
            gizmoManager.positionGizmoEnabled = true;
            break;
          }
          case 'rotation': {
            gizmoManager.rotationGizmoEnabled = true;
          }
          case 'scale': {
            gizmoManager.scaleGizmoEnabled = true;
          }
          default: {
            break;
          }
        }
        if (selectedTargets[0].getClassName() === 'TransformNode') {
          // transformNode 단일 선택 시
          gizmoManager.attachToNode(selectedTargets[0]);

          return () => {
            // 선택효과 해제
            const target = selectedTargets[0];
            if (checkIsTargetMesh(target)) {
              // 컨트롤러
              target.renderOutline = false;
            } else {
              // joint
              const joint = target
                .getScene()
                .getMeshByID(target.id.replace('transformNode', 'joint'));
              if (joint) {
                joint.renderOutline = false;
              }
            }
          };
        } else if (selectedTargets[0].getClassName() === 'Mesh') {
          // controller 단일 선택 시
          gizmoManager.attachToMesh(selectedTargets[0] as BABYLON.Mesh);

          const linkedTransformNode = selectedTargets[0]
            .getScene()
            .getTransformNodeByID(selectedTargets[0].id.replace('controller', 'transformNode'));

          const addPositionDragObservable = (
            target: BABYLON.TransformNode,
            gizmo: BABYLON.AxisDragGizmo,
          ) => {
            return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
              target.setAbsolutePosition(
                new BABYLON.Vector3(
                  target.absolutePosition.x + delta.x,
                  target.absolutePosition.y + delta.y,
                  target.absolutePosition.z + delta.z,
                ),
              );
            });
          };

          const addRotationDragStartObservable = (
            position: BABYLON.Vector3,
            gizmo: BABYLON.PlaneRotationGizmo,
          ) => {
            return gizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
              // set drag start point as lastDragPosition
              position.copyFrom(dragPlanePoint);
            });
          };

          const addRotationDragObservable = (
            target: BABYLON.TransformNode,
            position: BABYLON.Vector3,
            normal: BABYLON.Vector3,
            localNormal: BABYLON.Vector3,
            matrix: BABYLON.Matrix,
            snapDistance: number,
            amount: BABYLON.Quaternion,
            tmp: BABYLON.Matrix,
            gizmo: BABYLON.PlaneRotationGizmo,
          ) => {
            return gizmo.dragBehavior.onDragObservable.add(({ dragPlanePoint, dragDistance }) => {
              // decompose the world matrix of the linkedTransformNode
              const nodeScale = new BABYLON.Vector3(1, 1, 1);
              const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
              const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
              target.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

              const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
              const originalVector = position.subtract(nodeTranslation).normalize();

              const cross = BABYLON.Vector3.Cross(newVector, originalVector);
              const dot = BABYLON.Vector3.Dot(newVector, originalVector);

              // cross.length() can be the reason of the bug
              let angle = Math.atan2(cross.length(), dot);

              const planeNormal = new BABYLON.Vector3(1, 0, 0);
              normal.copyFrom(planeNormal);
              localNormal.copyFrom(planeNormal);
              if (gizmo.updateGizmoRotationToMatchAttachedMesh) {
                nodeQuaternion.toRotationMatrix(matrix);
                localNormal = BABYLON.Vector3.TransformCoordinates(normal, matrix);
              }

              // Flip up vector depending on which side the camera is on
              let cameraFlipped = false;
              if (gizmo.gizmoLayer.utilityLayerScene.activeCamera) {
                const camVec = gizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(
                  nodeTranslation,
                );
                if (BABYLON.Vector3.Dot(camVec, localNormal) > 0) {
                  normal.scaleInPlace(-1);
                  localNormal.scaleInPlace(-1);
                  cameraFlipped = true;
                }
              }
              const halfCircleSide = BABYLON.Vector3.Dot(localNormal, cross) > 0.0;
              if (halfCircleSide) {
                angle = -angle;
              }
              if (gizmo.snapDistance !== 0) {
                snapDistance += angle;
                if (Math.abs(snapDistance) > gizmo.snapDistance) {
                  let dragSteps = Math.floor(Math.abs(snapDistance) / gizmo.snapDistance);
                  if (snapDistance < 0) {
                    dragSteps *= -1;
                  }
                  snapDistance = snapDistance % gizmo.snapDistance;
                  angle = gizmo.snapDistance * dragSteps;
                } else {
                  angle = 0;
                }
              }

              dragDistance += cameraFlipped ? -angle : angle;

              const quaternionCoefficient = Math.sin(angle / 2);
              amount.set(
                normal.x * quaternionCoefficient,
                normal.y * quaternionCoefficient,
                normal.z * quaternionCoefficient,
                Math.cos(angle / 2),
              );

              if (tmp.determinant() > 0) {
                const tmpVector = new BABYLON.Vector3();
                amount.toEulerAnglesToRef(tmpVector);
                BABYLON.Quaternion.RotationYawPitchRollToRef(
                  tmpVector.y,
                  -tmpVector.x,
                  -tmpVector.z,
                  amount,
                );
              }
              if (gizmo.updateGizmoRotationToMatchAttachedMesh) {
                nodeQuaternion.multiplyToRef(amount, nodeQuaternion);
              } else {
                amount.multiplyToRef(nodeQuaternion, nodeQuaternion);
              }
              target.addRotation(2 * amount.x, 2 * amount.y, 2 * amount.z);
              position.copyFrom(dragPlanePoint);
            });
          };

          const addScaleDragObservable = (
            target: BABYLON.TransformNode,
            gizmo: BABYLON.AxisScaleGizmo,
          ) => {
            return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
              target.scaling = new BABYLON.Vector3(
                target.scaling.x + delta.x,
                target.scaling.y + delta.y,
                target.scaling.z + delta.z,
              );
            });
          };

          // controller 부착 시의 gizmo control customize
          if (linkedTransformNode) {
            if (gizmoManager.positionGizmoEnabled && currentGizmoMode === 'position') {
              const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.positionGizmo!;
              const xPositionDragObservable = addPositionDragObservable(
                linkedTransformNode,
                xGizmo,
              );
              const yPositionDragObservable = addPositionDragObservable(
                linkedTransformNode,
                yGizmo,
              );
              const zPositionDragObservable = addPositionDragObservable(
                linkedTransformNode,
                zGizmo,
              );

              return () => {
                // observable 제거
                xGizmo.dragBehavior.onDragObservable.remove(xPositionDragObservable);
                yGizmo.dragBehavior.onDragObservable.remove(yPositionDragObservable);
                zGizmo.dragBehavior.onDragObservable.remove(zPositionDragObservable);

                // 선택효과 해제
                const target = selectedTargets[0];
                if (checkIsTargetMesh(target)) {
                  // 컨트롤러
                  target.renderOutline = false;
                } else {
                  // joint
                  const joint = target
                    .getScene()
                    .getMeshByID(target.id.replace('transformNode', 'joint'));
                  if (joint) {
                    joint.renderOutline = false;
                  }
                }
              };
            } else if (gizmoManager.rotationGizmoEnabled && currentGizmoMode === 'rotation') {
              const lastDragPosition = new BABYLON.Vector3();
              const rotationMatrix = new BABYLON.Matrix();
              const planeNormalTowardsCamera = new BABYLON.Vector3();
              let localPlaneNormalTowardsCamera = new BABYLON.Vector3();
              let currentSnapDragDistance = 0;
              const tmpMatrix = new BABYLON.Matrix();
              const amountToRotate = new BABYLON.Quaternion();

              const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.rotationGizmo!;

              const xRotationDragStartObservable = addRotationDragStartObservable(
                lastDragPosition,
                xGizmo,
              );

              const xRotationDragObservable = addRotationDragObservable(
                linkedTransformNode,
                lastDragPosition,
                planeNormalTowardsCamera,
                localPlaneNormalTowardsCamera,
                rotationMatrix,
                currentSnapDragDistance,
                amountToRotate,
                tmpMatrix,
                xGizmo,
              );

              const yRotationDragStartObservable = addRotationDragStartObservable(
                lastDragPosition,
                yGizmo,
              );

              const yRotationDragObservable = addRotationDragObservable(
                linkedTransformNode,
                lastDragPosition,
                planeNormalTowardsCamera,
                localPlaneNormalTowardsCamera,
                rotationMatrix,
                currentSnapDragDistance,
                amountToRotate,
                tmpMatrix,
                yGizmo,
              );

              const zRotationDragStartObservable = addRotationDragStartObservable(
                lastDragPosition,
                zGizmo,
              );

              const zRotationDragObservable = addRotationDragObservable(
                linkedTransformNode,
                lastDragPosition,
                planeNormalTowardsCamera,
                localPlaneNormalTowardsCamera,
                rotationMatrix,
                currentSnapDragDistance,
                amountToRotate,
                tmpMatrix,
                zGizmo,
              );

              return () => {
                // observable 제거
                xGizmo.dragBehavior.onDragStartObservable.remove(xRotationDragStartObservable);
                xGizmo.dragBehavior.onDragObservable.remove(xRotationDragObservable);
                yGizmo.dragBehavior.onDragStartObservable.remove(yRotationDragStartObservable);
                yGizmo.dragBehavior.onDragObservable.remove(yRotationDragObservable);
                zGizmo.dragBehavior.onDragStartObservable.remove(zRotationDragStartObservable);
                zGizmo.dragBehavior.onDragObservable.remove(zRotationDragObservable);

                // 선택효과 해제
                const target = selectedTargets[0];
                if (checkIsTargetMesh(target)) {
                  // 컨트롤러
                  target.renderOutline = false;
                } else {
                  // joint
                  const joint = target
                    .getScene()
                    .getMeshByID(target.id.replace('transformNode', 'joint'));
                  if (joint) {
                    joint.renderOutline = false;
                  }
                }
              };
            } else if (gizmoManager.scaleGizmoEnabled && currentGizmoMode === 'scale') {
              const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.scaleGizmo!;

              const xScaleObservable = addScaleDragObservable(linkedTransformNode, xGizmo);

              const yScaleObservable = addScaleDragObservable(linkedTransformNode, yGizmo);

              const zScaleObservable = addScaleDragObservable(linkedTransformNode, zGizmo);

              return () => {
                // observable 제거
                xGizmo.dragBehavior.onDragObservable.remove(xScaleObservable);
                yGizmo.dragBehavior.onDragObservable.remove(yScaleObservable);
                zGizmo.dragBehavior.onDragObservable.remove(zScaleObservable);

                // 선택효과 해제
                const target = selectedTargets[0];
                if (checkIsTargetMesh(target)) {
                  // 컨트롤러
                  target.renderOutline = false;
                } else {
                  // joint
                  const joint = target
                    .getScene()
                    .getMeshByID(target.id.replace('transformNode', 'joint'));
                  if (joint) {
                    joint.renderOutline = false;
                  }
                }
              };
            }
          }
        }
      } else {
        // 다중선택 모드일 때의 gizmo 조작
        gizmoManager.attachToNode(null); // R&D 후 gizmo control 변경 필요

        const selectedTransformNodes = selectedTargets.filter(
          (target) => target.getClassName() === 'TransformNode',
        ) as BABYLON.TransformNode[];
        const selectedControllers = selectedTargets.filter(
          (target) => target.getClassName() === 'Mesh',
        ) as BABYLON.Mesh[];

        return () => {
          // 선택효과 해제
          selectedTargets.forEach((target) => {
            if (checkIsTargetMesh(target)) {
              // 컨트롤러
              target.renderOutline = false;
            } else {
              // joint
              const joint = target
                .getScene()
                .getMeshByID(target.id.replace('transformNode', 'joint'));
              if (joint) {
                joint.renderOutline = false;
              }
            }
          });
        };
      }
    }
  }, [currentGizmoMode, gizmoManager, selectedTargets]);

  // gizmoManager 관련 단축키 설정
  useEffect(() => {
    if (gizmoManager) {
      const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
          case 'w':
          case 'W':
          case 'ㅈ': {
            setCurrentGizmoMode('position');
            gizmoManager.positionGizmoEnabled = true;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = false;
            break;
          }
          case 'e':
          case 'E':
          case 'ㄷ': {
            setCurrentGizmoMode('rotation');
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = true;
            gizmoManager.scaleGizmoEnabled = false;
            break;
          }
          case 'r':
          case 'R':
          case 'ㄱ': {
            setCurrentGizmoMode('scale');
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = true;
            break;
          }
          case 'Escape': {
            gizmoManager.attachToNode(null);
            dispatch(selectingDataActions.resetSelectedTargets());
            break;
          }
          default: {
            break;
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [dispatch, gizmoManager]);
};

export default useGizmoControl;
