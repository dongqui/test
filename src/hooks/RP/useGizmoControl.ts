import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as selectingDataActions from 'actions/selectingDataAction';
import { checkIsTargetMesh } from 'utils/RP';

type GizmoMode = 'position' | 'rotation' | 'scale';

const useGizmoControl = () => {
  const sceneList = useSelector((state) => state.plaskProject.sceneList);
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
            break;
          }
          case 'scale': {
            gizmoManager.scaleGizmoEnabled = true;
            break;
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
              const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
              if (joint) {
                joint.renderOutline = false;
              }
            }
          };
        } else if (selectedTargets[0].getClassName() === 'Mesh') {
          // controller 단일 선택 시
          gizmoManager.attachToMesh(selectedTargets[0] as BABYLON.Mesh);

          const linkedTransformNode = selectedTargets[0].getScene().getTransformNodeByID(selectedTargets[0].id.replace('controller', 'transformNode'));

          const addPositionDragObservable = (target: BABYLON.TransformNode, gizmo: BABYLON.AxisDragGizmo) => {
            return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
              target.setAbsolutePosition(new BABYLON.Vector3(target.absolutePosition.x + delta.x, target.absolutePosition.y + delta.y, target.absolutePosition.z + delta.z));
            });
          };

          const addScaleDragObservable = (target: BABYLON.TransformNode, gizmo: BABYLON.AxisScaleGizmo) => {
            return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
              target.scaling = new BABYLON.Vector3(target.scaling.x + delta.x, target.scaling.y + delta.y, target.scaling.z + delta.z);
            });
          };

          // controller 부착 시의 gizmo control customize
          if (linkedTransformNode) {
            if (gizmoManager.positionGizmoEnabled && currentGizmoMode === 'position') {
              const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.positionGizmo!;
              const xPositionDragObservable = addPositionDragObservable(linkedTransformNode, xGizmo);
              const yPositionDragObservable = addPositionDragObservable(linkedTransformNode, yGizmo);
              const zPositionDragObservable = addPositionDragObservable(linkedTransformNode, zGizmo);

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
                  const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
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

              const xRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
                // set drag start point as lastDragPosition
                lastDragPosition.copyFrom(dragPlanePoint);
              });

              const xRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.add(({ dragPlanePoint, dragDistance }) => {
                // decompose the world matrix of the linkedTransformNode
                const nodeScale = new BABYLON.Vector3(1, 1, 1);
                const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

                const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                // cross.length() can be the reason of the bug
                let angle = Math.atan2(cross.length(), dot);

                const planeNormal = new BABYLON.Vector3(1, 0, 0);
                planeNormalTowardsCamera.copyFrom(planeNormal);
                localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                  nodeQuaternion.toRotationMatrix(rotationMatrix);
                  localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
                }

                // Flip up vector depending on which side the camera is on
                let cameraFlipped = false;
                if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
                  var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
                  if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                    planeNormalTowardsCamera.scaleInPlace(-1);
                    localPlaneNormalTowardsCamera.scaleInPlace(-1);
                    cameraFlipped = true;
                  }
                }
                var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                if (halfCircleSide) {
                  angle = -angle;
                }
                if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                  currentSnapDragDistance += angle;
                  if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
                    let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
                    if (currentSnapDragDistance < 0) {
                      dragSteps *= -1;
                    }
                    currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
                    angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
                  } else {
                    angle = 0;
                  }
                }

                dragDistance += cameraFlipped ? -angle : angle;

                const quaternionCoefficient = Math.sin(angle / 2);
                amountToRotate.set(
                  planeNormalTowardsCamera.x * quaternionCoefficient,
                  planeNormalTowardsCamera.y * quaternionCoefficient,
                  planeNormalTowardsCamera.z * quaternionCoefficient,
                  Math.cos(angle / 2),
                );

                if (tmpMatrix.determinant() > 0) {
                  const tmpVector = new BABYLON.Vector3();
                  amountToRotate.toEulerAnglesToRef(tmpVector);
                  BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
                }
                if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                  nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                } else {
                  amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                }
                linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
                lastDragPosition.copyFrom(dragPlanePoint);
              });

              const yRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
                // set drag start point as lastDragPosition
                lastDragPosition.copyFrom(dragPlanePoint);
              });

              const yRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.add(
                ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
                  // decompose the world matrix of the linkedTransformNode
                  const nodeScale = new BABYLON.Vector3(1, 1, 1);
                  const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                  const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                  linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

                  const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                  const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                  const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                  const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                  // cross.length() can be the reason of the bug
                  let angle = Math.atan2(cross.length(), dot);

                  const planeNormal = new BABYLON.Vector3(0, 1, 0);
                  planeNormalTowardsCamera.copyFrom(planeNormal);
                  localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
                  }

                  // Flip up vector depending on which side the camera is on
                  let cameraFlipped = false;
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
                    var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
                    if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                      planeNormalTowardsCamera.scaleInPlace(-1);
                      localPlaneNormalTowardsCamera.scaleInPlace(-1);
                      cameraFlipped = true;
                    }
                  }
                  var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                  if (halfCircleSide) {
                    angle = -angle;
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                    currentSnapDragDistance += angle;
                    if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
                      let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
                      if (currentSnapDragDistance < 0) {
                        dragSteps *= -1;
                      }
                      currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
                      angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
                    } else {
                      angle = 0;
                    }
                  }

                  dragDistance += cameraFlipped ? -angle : angle;

                  const quaternionCoefficient = Math.sin(angle / 2);
                  amountToRotate.set(
                    planeNormalTowardsCamera.x * quaternionCoefficient,
                    planeNormalTowardsCamera.y * quaternionCoefficient,
                    planeNormalTowardsCamera.z * quaternionCoefficient,
                    Math.cos(angle / 2),
                  );

                  if (tmpMatrix.determinant() > 0) {
                    const tmpVector = new BABYLON.Vector3();
                    amountToRotate.toEulerAnglesToRef(tmpVector);
                    BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                  } else {
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                  }
                  linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );

              const zRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
                // set drag start point as lastDragPosition
                lastDragPosition.copyFrom(dragPlanePoint);
              });

              const zRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.add(
                ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
                  // decompose the world matrix of the linkedTransformNode
                  const nodeScale = new BABYLON.Vector3(1, 1, 1);
                  const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                  const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                  linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

                  const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                  const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                  const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                  const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                  // cross.length() can be the reason of the bug
                  let angle = Math.atan2(cross.length(), dot);

                  const planeNormal = new BABYLON.Vector3(0, 0, 1);
                  planeNormalTowardsCamera.copyFrom(planeNormal);
                  localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
                  }

                  // Flip up vector depending on which side the camera is on
                  let cameraFlipped = false;
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
                    var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
                    if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                      planeNormalTowardsCamera.scaleInPlace(-1);
                      localPlaneNormalTowardsCamera.scaleInPlace(-1);
                      cameraFlipped = true;
                    }
                  }
                  var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                  if (halfCircleSide) {
                    angle = -angle;
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                    currentSnapDragDistance += angle;
                    if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
                      let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
                      if (currentSnapDragDistance < 0) {
                        dragSteps *= -1;
                      }
                      currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
                      angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
                    } else {
                      angle = 0;
                    }
                  }

                  dragDistance += cameraFlipped ? -angle : angle;

                  const quaternionCoefficient = Math.sin(angle / 2);
                  amountToRotate.set(
                    planeNormalTowardsCamera.x * quaternionCoefficient,
                    planeNormalTowardsCamera.y * quaternionCoefficient,
                    planeNormalTowardsCamera.z * quaternionCoefficient,
                    Math.cos(angle / 2),
                  );

                  if (tmpMatrix.determinant() > 0) {
                    const tmpVector = new BABYLON.Vector3();
                    amountToRotate.toEulerAnglesToRef(tmpVector);
                    BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                  } else {
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                  }
                  linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );

              return () => {
                // observable 제거
                gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.remove(xRotationDragStartObservable);
                gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.remove(xRotationDragObservable);
                gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.remove(yRotationDragStartObservable);
                gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.remove(yRotationDragObservable);
                gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.remove(zRotationDragStartObservable);
                gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.remove(zRotationDragObservable);

                // 선택효과 해제
                const target = selectedTargets[0];
                if (checkIsTargetMesh(target)) {
                  // 컨트롤러
                  target.renderOutline = false;
                } else {
                  // joint
                  const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
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
                  const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
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

        const selectedTransformNodes = selectedTargets.filter((target) => target.getClassName() === 'TransformNode') as BABYLON.TransformNode[];
        const selectedControllers = selectedTargets.filter((target) => target.getClassName() === 'Mesh') as BABYLON.Mesh[];

        return () => {
          // 선택효과 해제
          selectedTargets.forEach((target) => {
            if (checkIsTargetMesh(target)) {
              // 컨트롤러
              target.renderOutline = false;
            } else {
              // joint
              const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
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
        // input 입력 중에는 적용되지 않도록 수정
        const target = event.target as Element;
        if (target.tagName.toLowerCase() === 'input') {
          return;
        }

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

      let isDragging = false;

      const isTargetGizmoMesh = (target: BABYLON.AbstractMesh) => {
        // position gizmo mesh
        if (target.id.toLowerCase() === 'cylinder') {
          return true;
        }

        // rotation gizmo mesh
        if (target.id.toLowerCase() === 'ignore') {
          return true;
        }

        // scale gizmo mesh
        if (target.id.toLowerCase().includes('posmesh')) {
          return true;
        }
        // not gizmo mesh
        return false;
      };

      // custom cursor 적용
      const pointerObservable = gizmoManager.utilityLayer.utilityLayerScene.onPointerObservable.add((event) => {
        if (event.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          if (event.pickInfo?.hit && event.pickInfo.pickedMesh && isTargetGizmoMesh(event.pickInfo.pickedMesh)) {
            isDragging = true;
          }
        } else if (event.type === BABYLON.PointerEventTypes.POINTERUP) {
          isDragging = false;
        } else if (event.type === BABYLON.PointerEventTypes.POINTERMOVE) {
          if (isDragging) {
            // drag 중인 상태에서는 hover가 적용되지 않는 곳으로 마우스를 옮겨도 default로 돌아가지 않음
            if (currentGizmoMode === 'position') {
              if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorPosition.png") 12 12, auto') {
                gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorPosition.png") 12 12, auto';
              }
            } else if (currentGizmoMode === 'rotation') {
              if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorRotation.png") 12 12, auto') {
                gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorRotation.png") 12 12, auto';
              }
            } else if (currentGizmoMode === 'scale') {
              if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorScale.png") 12 12, auto') {
                gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorScale.png") 12 12, auto';
              }
            }
          } else {
            // drag 중이 아닐 때는, mouse가 pickable한 mesh와 위치상 겹치는 지를 체크하고
            // 겹치는 경우 해당하는 커스텀 커서를 적용
            if (event.pickInfo?.hit && event.pickInfo.pickedMesh && isTargetGizmoMesh(event.pickInfo.pickedMesh)) {
              if (currentGizmoMode === 'position') {
                if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorPosition.png") 12 12, auto') {
                  gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorPosition.png") 12 12, auto';
                }
              } else if (currentGizmoMode === 'rotation') {
                if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorRotation.png") 12 12, auto') {
                  gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorRotation.png") 12 12, auto';
                }
              } else if (currentGizmoMode === 'scale') {
                if (gizmoManager.utilityLayer.originalScene.defaultCursor !== 'url("images/cursorScale.png") 12 12, auto') {
                  gizmoManager.utilityLayer.originalScene.defaultCursor = 'url("images/cursorScale.png") 12 12, auto';
                }
              }
            } else {
              gizmoManager.utilityLayer.originalScene.defaultCursor = 'default';
            }
          }
        }
      });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);

        gizmoManager.utilityLayer.utilityLayerScene.onPointerObservable.remove(pointerObservable);
      };
    }
  }, [currentGizmoMode, dispatch, gizmoManager]);
};

export default useGizmoControl;
