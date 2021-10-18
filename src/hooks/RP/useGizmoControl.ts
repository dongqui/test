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

      // gizmoManager attach에 대한 observable 설정
      innerGizmoManager.onAttachedToMeshObservable.add((mesh) => {});
      innerGizmoManager.onAttachedToNodeObservable.add((transformNode) => {});
    }
  }, [sceneList]);

  // 선택 대상 변경에 따른 gizmo attach
  useEffect(() => {
    // 선택효과 적용
    selectedTargets.forEach((target) => {
      if (checkIsTargetMesh(target)) {
        // 컨트롤러
        // target.overlayAlpha = 1;
        // target.overlayColor = BABYLON.Color3.White();
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
        if (selectedTargets[0].getClassName() === 'TransformNode') {
          // transformNode 단일 선택 시
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

          // controller 부착 시의 gizmo control customize
          if (linkedTransformNode) {
            if (gizmoManager.positionGizmoEnabled && currentGizmoMode === 'position') {
              const xPositionObservable = gizmoManager.gizmos.positionGizmo!.xGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.setAbsolutePosition(
                    new BABYLON.Vector3(
                      linkedTransformNode.absolutePosition.x + delta.x,
                      linkedTransformNode.absolutePosition.y + delta.y,
                      linkedTransformNode.absolutePosition.z + delta.z,
                    ),
                  );
                },
              );
              const yPositionObservable = gizmoManager.gizmos.positionGizmo!.yGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.setAbsolutePosition(
                    new BABYLON.Vector3(
                      linkedTransformNode.absolutePosition.x + delta.x,
                      linkedTransformNode.absolutePosition.y + delta.y,
                      linkedTransformNode.absolutePosition.z + delta.z,
                    ),
                  );
                },
              );
              const zPositionObservable = gizmoManager.gizmos.positionGizmo!.zGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.setAbsolutePosition(
                    new BABYLON.Vector3(
                      linkedTransformNode.absolutePosition.x + delta.x,
                      linkedTransformNode.absolutePosition.y + delta.y,
                      linkedTransformNode.absolutePosition.z + delta.z,
                    ),
                  );
                },
              );

              return () => {
                gizmoManager.gizmos.positionGizmo!.xGizmo.dragBehavior.onDragObservable.remove(
                  xPositionObservable,
                );
                gizmoManager.gizmos.positionGizmo!.yGizmo.dragBehavior.onDragObservable.remove(
                  yPositionObservable,
                );
                gizmoManager.gizmos.positionGizmo!.zGizmo.dragBehavior.onDragObservable.remove(
                  zPositionObservable,
                );

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

              const xRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.add(
                ({ dragPlanePoint, pointerId }) => {
                  // set drag start point as lastDragPosition
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              const xRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.add(
                ({ dragPlanePoint, dragDistance }) => {
                  // decompose the world matrix of the linkedTransformNode
                  const nodeScale = new BABYLON.Vector3(1, 1, 1);
                  const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                  const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                  linkedTransformNode
                    .getWorldMatrix()
                    .decompose(nodeScale, nodeQuaternion, nodeTranslation);

                  const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                  const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                  const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                  const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                  // cross.length() can be the reason of the bug
                  let angle = Math.atan2(cross.length(), dot);

                  const planeNormal = new BABYLON.Vector3(1, 0, 0);
                  planeNormalTowardsCamera.copyFrom(planeNormal);
                  localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(
                      planeNormalTowardsCamera,
                      rotationMatrix,
                    );
                  }

                  // Flip up vector depending on which side the camera is on
                  let cameraFlipped = false;
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene
                      .activeCamera
                  ) {
                    var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(
                      nodeTranslation,
                    );
                    if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                      planeNormalTowardsCamera.scaleInPlace(-1);
                      localPlaneNormalTowardsCamera.scaleInPlace(-1);
                      cameraFlipped = true;
                    }
                  }
                  var halfCircleSide =
                    BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                  if (halfCircleSide) {
                    angle = -angle;
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                    currentSnapDragDistance += angle;
                    if (
                      Math.abs(currentSnapDragDistance) >
                      gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance
                    ) {
                      let dragSteps = Math.floor(
                        Math.abs(currentSnapDragDistance) /
                          gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance,
                      );
                      if (currentSnapDragDistance < 0) {
                        dragSteps *= -1;
                      }
                      currentSnapDragDistance =
                        currentSnapDragDistance %
                        gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
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
                    BABYLON.Quaternion.RotationYawPitchRollToRef(
                      tmpVector.y,
                      -tmpVector.x,
                      -tmpVector.z,
                      amountToRotate,
                    );
                  }
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                  } else {
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                  }
                  linkedTransformNode.addRotation(
                    2 * amountToRotate.x,
                    2 * amountToRotate.y,
                    2 * amountToRotate.z,
                  );
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              const yRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.add(
                ({ dragPlanePoint, pointerId }) => {
                  // set drag start point as lastDragPosition
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              const yRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.add(
                ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
                  // decompose the world matrix of the linkedTransformNode
                  const nodeScale = new BABYLON.Vector3(1, 1, 1);
                  const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                  const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                  linkedTransformNode
                    .getWorldMatrix()
                    .decompose(nodeScale, nodeQuaternion, nodeTranslation);

                  const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                  const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                  const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                  const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                  // cross.length() can be the reason of the bug
                  let angle = Math.atan2(cross.length(), dot);

                  const planeNormal = new BABYLON.Vector3(0, 1, 0);
                  planeNormalTowardsCamera.copyFrom(planeNormal);
                  localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(
                      planeNormalTowardsCamera,
                      rotationMatrix,
                    );
                  }

                  // Flip up vector depending on which side the camera is on
                  let cameraFlipped = false;
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene
                      .activeCamera
                  ) {
                    var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(
                      nodeTranslation,
                    );
                    if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                      planeNormalTowardsCamera.scaleInPlace(-1);
                      localPlaneNormalTowardsCamera.scaleInPlace(-1);
                      cameraFlipped = true;
                    }
                  }
                  var halfCircleSide =
                    BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                  if (halfCircleSide) {
                    angle = -angle;
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                    currentSnapDragDistance += angle;
                    if (
                      Math.abs(currentSnapDragDistance) >
                      gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance
                    ) {
                      let dragSteps = Math.floor(
                        Math.abs(currentSnapDragDistance) /
                          gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance,
                      );
                      if (currentSnapDragDistance < 0) {
                        dragSteps *= -1;
                      }
                      currentSnapDragDistance =
                        currentSnapDragDistance %
                        gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
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
                    BABYLON.Quaternion.RotationYawPitchRollToRef(
                      tmpVector.y,
                      -tmpVector.x,
                      -tmpVector.z,
                      amountToRotate,
                    );
                  }
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                  } else {
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                  }
                  linkedTransformNode.addRotation(
                    2 * amountToRotate.x,
                    2 * amountToRotate.y,
                    2 * amountToRotate.z,
                  );
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              const zRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.add(
                ({ dragPlanePoint, pointerId }) => {
                  // set drag start point as lastDragPosition
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              const zRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.add(
                ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
                  // decompose the world matrix of the linkedTransformNode
                  const nodeScale = new BABYLON.Vector3(1, 1, 1);
                  const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
                  const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
                  linkedTransformNode
                    .getWorldMatrix()
                    .decompose(nodeScale, nodeQuaternion, nodeTranslation);

                  const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
                  const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

                  const cross = BABYLON.Vector3.Cross(newVector, originalVector);
                  const dot = BABYLON.Vector3.Dot(newVector, originalVector);

                  // cross.length() can be the reason of the bug
                  let angle = Math.atan2(cross.length(), dot);

                  const planeNormal = new BABYLON.Vector3(0, 0, 1);
                  planeNormalTowardsCamera.copyFrom(planeNormal);
                  localPlaneNormalTowardsCamera.copyFrom(planeNormal);
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.toRotationMatrix(rotationMatrix);
                    localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(
                      planeNormalTowardsCamera,
                      rotationMatrix,
                    );
                  }

                  // Flip up vector depending on which side the camera is on
                  let cameraFlipped = false;
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene
                      .activeCamera
                  ) {
                    var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(
                      nodeTranslation,
                    );
                    if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
                      planeNormalTowardsCamera.scaleInPlace(-1);
                      localPlaneNormalTowardsCamera.scaleInPlace(-1);
                      cameraFlipped = true;
                    }
                  }
                  var halfCircleSide =
                    BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
                  if (halfCircleSide) {
                    angle = -angle;
                  }
                  if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
                    currentSnapDragDistance += angle;
                    if (
                      Math.abs(currentSnapDragDistance) >
                      gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance
                    ) {
                      let dragSteps = Math.floor(
                        Math.abs(currentSnapDragDistance) /
                          gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance,
                      );
                      if (currentSnapDragDistance < 0) {
                        dragSteps *= -1;
                      }
                      currentSnapDragDistance =
                        currentSnapDragDistance %
                        gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
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
                    BABYLON.Quaternion.RotationYawPitchRollToRef(
                      tmpVector.y,
                      -tmpVector.x,
                      -tmpVector.z,
                      amountToRotate,
                    );
                  }
                  if (
                    gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh
                  ) {
                    nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
                  } else {
                    amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
                  }
                  linkedTransformNode.addRotation(
                    2 * amountToRotate.x,
                    2 * amountToRotate.y,
                    2 * amountToRotate.z,
                  );
                  lastDragPosition.copyFrom(dragPlanePoint);
                },
              );
              return () => {
                gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.remove(
                  xRotationDragStartObservable,
                );
                gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.remove(
                  xRotationDragObservable,
                );
                gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.remove(
                  yRotationDragStartObservable,
                );
                gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.remove(
                  yRotationDragObservable,
                );
                gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.remove(
                  zRotationDragStartObservable,
                );
                gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.remove(
                  zRotationDragObservable,
                );

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
              const xScaleObservable = gizmoManager.gizmos.scaleGizmo!.xGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.scaling = new BABYLON.Vector3(
                    linkedTransformNode.scaling.x + delta.x,
                    linkedTransformNode.scaling.y + delta.y,
                    linkedTransformNode.scaling.z + delta.z,
                  );
                },
              );
              const yScaleObservable = gizmoManager.gizmos.scaleGizmo!.yGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.scaling = new BABYLON.Vector3(
                    linkedTransformNode.scaling.x + delta.x,
                    linkedTransformNode.scaling.y + delta.y,
                    linkedTransformNode.scaling.z + delta.z,
                  );
                },
              );
              const zScaleObservable = gizmoManager.gizmos.scaleGizmo!.zGizmo.dragBehavior.onDragObservable.add(
                ({ delta }) => {
                  linkedTransformNode.scaling = new BABYLON.Vector3(
                    linkedTransformNode.scaling.x + delta.x,
                    linkedTransformNode.scaling.y + delta.y,
                    linkedTransformNode.scaling.z + delta.z,
                  );
                },
              );

              return () => {
                gizmoManager.gizmos.scaleGizmo!.xGizmo.dragBehavior.onDragObservable.remove(
                  xScaleObservable,
                );
                gizmoManager.gizmos.scaleGizmo!.yGizmo.dragBehavior.onDragObservable.remove(
                  yScaleObservable,
                );
                gizmoManager.gizmos.scaleGizmo!.zGizmo.dragBehavior.onDragObservable.remove(
                  zScaleObservable,
                );

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
