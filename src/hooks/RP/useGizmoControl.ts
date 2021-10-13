import { useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as selectingDataActions from 'actions/selectingDataAction';

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
        } else if (selectedTargets[0].getClassName() === 'Mesh') {
          // controller 단일 선택 시
        }
      } else {
        // 다중선택 모드일 때의 gizmo 조작
        const selectedTransformNodes = selectedTargets.filter(
          (target) => target.getClassName() === 'TransformNode',
        );
        const selectedControllers = selectedTargets.filter(
          (target) => target.getClassName() === 'Mesh',
        );
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
