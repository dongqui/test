import * as BABYLON from '@babylonjs/core';
import { FunctionComponent, useRef, useEffect, useMemo, useState, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as screenDataActions from 'actions/screenDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as trackListActions from 'actions/trackList';
import rootReducer, { useSelector } from 'reducers';
import { Nullable, ScreenXY, PlaskView } from 'types/common';
import { ScreenVisivilityItem } from 'types/RP';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import { checkIsTargetMesh, createAnimationGroupFromIngredient } from 'utils/RP';
import ScreenVisibility from './ScreenVisibility';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { BabylonContext } from 'contexts/RP/BabylonContext';

const cx = classNames.bind(styles);

/**
 * consts
 */
const DEFAULT_CAMERA_POSITION_ARRAY = [0, 6, 10];
const DEFAULT_CAMERA_TARGET_ARRAY = [0, 0, 0];

/**
 * types and interfaces
 */

type GizmoMode = 'position' | 'rotation' | 'scale';

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  /**
   * global states
   */
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _fps = useSelector((state) => state.plaskProject.fps);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _visibilityOptions = useSelector((state) => state.screenData.visibilityOptions);
  const _plaskSkeletonViewers = useSelector((state) => state.screenData.plaskSkeletonViewers);

  const dispatch = useDispatch();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const renderingCanvas1 = useRef<HTMLCanvasElement>(null);

  /**
   * 동시키 입력을 위한 객체
   */
  const multiKeyController = useMemo(
    () => ({
      v: { pressed: false },
      V: { pressed: false },
      ㅍ: { pressed: false },
      r: { pressed: false },
      R: { pressed: false },
      ㄱ: { pressed: false },
      k: { pressed: false },
      K: { pressed: false },
      ㅏ: { pressed: false },
      f: { pressed: false },
      F: { pressed: false },
      ㄹ: { pressed: false },
    }),
    [],
  );

  /****************************************************************************
   * 기존 useInitializeScene의 내용
   * Babylon Engine과 Scene을 생성하고 Camera, Ground 등 렌더링 엔진의 기본요소를 설정합니다.
   *****************************************************************************/

  /**
   * scene 생성 및 기본 설정
   */
  const { plaskEngine } = useContext(BabylonContext);

  // // Mapping state
  // const getNested = (obj: any, path: string) => {
  //   return path.split('.').reduce((p, c) => (p && p[c]) || null, obj);
  // };
  // const setNested = (obj: any, path: string, value: any) => {
  //   return path.split('.').reduce((o, p, i) => (o[p] = path.split('.').length === ++i ? value : o[p] || {}), obj);
  // };

  // const deps = [];
  // for (const id in SelectorModule.STATE) {
  //   const obj = (SelectorModule.STATE as ModuleState)[id];
  //   const variable = useSelector((state) => getNested(state, obj.reduxPath));
  //   deps.push(variable);
  // }

  // useCallback(() => {
  //   SelectorModule.Callback();
  // }, deps);

  useEffect(() => {
    if (renderingCanvas1.current) {
      // Initialize Plask engine
      // ? Can we have several canvas/engine ?
      plaskEngine.initialize(renderingCanvas1.current, dispatch);

      // scene의 생성과 소멸에 대한 observable을 생성하고 콜백을 추가합니다.
      plaskEngine.scene.onReadyObservable.addOnce(() => {
        // scene을 project reducer에 등록합니다.
        const newScreen = {
          id: plaskEngine.scene.uid,
          name: renderingCanvas1.current!.id.replace('renderingCanvas', 'scene'),
          scene: plaskEngine.scene,
          canvasId: renderingCanvas1.current!.id,
          hasShadow: true,
          hasGroundTexture: true,
        };
        dispatch(plaskProjectActions.addScreen({ screen: newScreen }));
        dispatch(screenDataActions.addScreen({ screenId: newScreen.id }));
      });

      const modules = plaskEngine.modules;

      // for (const module of modules) {
      //   // Hook states
      //   for (const field in module.state) {
      //     const variable = useSelector((state) => getNested(state, module.state[field].reduxPath));
      //     // module.state[field]._onChanged = () => dispatch(plaskEngineSyncAction(setNested({}, module.state[field].reduxPath, module.state[field].value)));
      //   }
      // }

      // plaskEngine.scene.onDisposeObservable.addOnce((scene) => {
      //   // scene이 사라지면 창을 새로고침합니다.
      //   // window.location.reload();
      // });

      // RP DOM은 반드시 존재하여 TS DAA 적용
      const targetNode = document.getElementById('RP')!;
      const config = { attributes: true };

      const handleEngineResize = () => {
        plaskEngine.resize();
      };

      const resizeMutationObserver = new MutationObserver(handleEngineResize);

      resizeMutationObserver.observe(targetNode, config);
      return () => {
        // engine을 없앱니다.
        plaskEngine.dispose();
        dispatch(plaskProjectActions.removeScreen({ screenId: plaskEngine.scene.uid }));

        resizeMutationObserver.disconnect();
      };
    }
  }, [plaskEngine, dispatch]);

  // Thes lines below are unnecessary, but I leave it so we can refer to the pattern
  // TODO: to delete eventually
  // const prevCameraPositions = useObserved(plaskEngine.cameraModule.onPrevPositionsChanged, plaskEngine.cameraModule.prevPositions)!;
  // const prevCameraTargets = useObserved(plaskEngine.cameraModule.onPrevTargetsChanged, plaskEngine.cameraModule.prevTargets)!;

  const prevCameraPositions = plaskEngine.cameraModule.prevPositions;
  const prevCameraTargets = plaskEngine.cameraModule.prevTargets;

  /**
   * dragBox 사용
   */
  const rpDragBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Check with Kenny how we can handle these screens
    // const targetScreen = _screenList.find((screen) => screen.canvasId === renderingCanvas1.current?.id);

    // if (targetScreen) {
    const dragBox = rpDragBox.current as HTMLDivElement;
    const dragBoxDefaultStyle = 'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
    dragBox.setAttribute('style', dragBoxDefaultStyle);

    // DragBox updated
    const selectBoxUpdatedObserver = plaskEngine.selectorModule.onSelectBoxUpdated.add(({ min, max }) => {
      dragBox.setAttribute('style', `${dragBoxDefaultStyle} left: ${min.x}px; top: ${min.y}px; width: ${max.x - min.x}px; height: ${max.y - min.y}px;`);
    });

    // DragBox end
    const endSelectBoxObserver = plaskEngine.selectorModule.onEndSelectBox.add(({ type, objects }) => {
      // if (type === 'ctrlKey') {
      //   dispatch(selectingDataActions.ctrlKeyMultiSelect({ targets: objects }));
      // } else {
      //   dispatch(selectingDataActions.defaultMultiSelect({ targets: objects }));
      // }
      dragBox.setAttribute('style', dragBoxDefaultStyle);
    });

    return () => {
      plaskEngine.selectorModule.onSelectBoxUpdated.remove(selectBoxUpdatedObserver);
      plaskEngine.selectorModule.onEndSelectBox.remove(endSelectBoxObserver);
    };
    // }
  }, [/* _screenList, */ _selectableObjects, dispatch, plaskEngine]);

  // useEffect(() => {
  //   const observer = plaskEngine.selectorModule.onSelectionChangeObservable.add((targets) => {
  //     dispatch(selectingDataActions.defaultMultiSelect({ targets }));
  //   });
  //   return () => {
  //     plaskEngine.selectorModule.onSelectionChangeObservable.remove(observer);
  //   };
  // }, [plaskEngine, dispatch]);

  /**
   * camera navigation, viewport 전환 관련 단축키 설정
   */
  useEffect(() => {
    const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
      camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
      camera.orthoTop = 2;
      camera.orthoBottom = -2;
      camera.orthoLeft = -2 * (canvas.width / canvas.height);
      camera.orthoRight = 2 * (canvas.width / canvas.height);

      const grounds = scene.getMeshesByTags('ground');
      grounds.forEach((ground) => {
        if (ground.id.split('//')[1] === view) {
          ground.isVisible = true;
        } else {
          ground.isVisible = false;
        }
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // input 입력 중에는 적용되지 않도록 수정
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
      if (focusedCanvas) {
        const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
        const focusedScene = focusedPlaskScreen?.scene;

        if (focusedScene && focusedScene.activeCamera) {
          const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
          const { position, target } = activeCamera;
          let distance: number;

          switch (event.key) {
            case 'v':
            case 'V':
            case 'ㅍ': // v (viewport)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              break;
            case 't':
            case 'T':
            case 'ㅅ': // t (top)
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'top');

              if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, distance + 10, target.z));
              break;
            case 'b':
            case 'B':
            case 'ㅠ': // b (bottom)
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'bottom');

              if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, -(distance + 10), target.z));
              break;
            case 'l':
            case 'L':
            case 'ㅣ': // l (left)
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'left');

              if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
              activeCamera.setPosition(new BABYLON.Vector3(-(distance + 10), target.y, target.z));
              break;
            case 'r':
            case 'R':
            case 'ㄱ': // r (right)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'right');

                if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                  prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                }

                distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
                activeCamera.setPosition(new BABYLON.Vector3(distance + 10, target.y, target.z));
              }

              break;
            case 'f':
            case 'F':
            case 'ㄹ': // f (front)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'front');

                if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                  prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                }

                distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, distance + 10));
              }
              break;
            case 'k':
            case 'K':
            case 'ㅏ': // k (back)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if (multiKeyController[event.key].pressed) {
                // v를 누르고 k
                if (multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) {
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'back');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                  activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, -(distance + 10)));
                }
              }
              break;
            case 'p':
            case 'P':
            case 'ㅔ': // p (perspective)
              if (activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                const prevCameraPosition = prevCameraPositions[focusedCanvas.id]?.clone();
                const prevCameraTarget = prevCameraTargets[focusedCanvas.id]?.clone();
                if (prevCameraPosition && prevCameraTarget) {
                  activeCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
                  activeCamera.setPosition(prevCameraPosition);
                  activeCamera.setTarget(prevCameraTarget);

                  prevCameraPositions[focusedCanvas.id] = null;
                  prevCameraTargets[focusedCanvas.id] = null;
                }

                const grounds = focusedScene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === 'top') {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              }
              break;
            case 'h':
            case 'H':
            case 'ㅗ': // h (camera reset)
              if (activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
                activeCamera.orthoTop = 2;
                activeCamera.orthoBottom = -2;
                activeCamera.orthoLeft = -2 * (focusedCanvas!.width / focusedCanvas!.height);
                activeCamera.orthoRight = 2 * (focusedCanvas!.width / focusedCanvas!.height);

                const grounds = focusedScene.getMeshesByTags('ground');
                const visibleGround = grounds.find((ground) => ground.isVisible);
                if (visibleGround) {
                  const currentView = visibleGround.id.split('//')[1];
                  const defaultPosition = BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY);
                  const defaultTarget = BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY);

                  let distance: number;

                  if (currentView === 'front') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, defaultPosition.z), new BABYLON.Vector3(0, 0, defaultTarget.z));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, defaultTarget.y, distance + 10));
                  } else if (currentView === 'back') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, defaultPosition.z), new BABYLON.Vector3(0, 0, defaultTarget.z));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, defaultTarget.y, -(distance + 10)));
                  } else if (currentView === 'top') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, defaultPosition.y, 0), new BABYLON.Vector3(0, defaultTarget.y, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, distance + 10, defaultTarget.z));
                  } else if (currentView === 'bottom') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, defaultPosition.y, 0), new BABYLON.Vector3(0, defaultTarget.y, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, -(distance + 10), defaultTarget.z));
                  } else if (currentView === 'left') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(defaultPosition.x, 0, 0), new BABYLON.Vector3(defaultTarget.x, 0, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(-(distance + 10), defaultTarget.y, defaultTarget.z));
                  } else if (currentView === 'right') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(defaultPosition.x, 0, 0), new BABYLON.Vector3(defaultTarget.x, 0, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(distance + 10, defaultTarget.y, defaultTarget.z));
                  }
                  activeCamera.setTarget(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY));
                }
              } else if (activeCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                activeCamera.setPosition(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY));
                activeCamera.setTarget(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY));
              }
              break;
            case 'a':
            case 'A':
            case 'ㅁ':
              if (event.ctrlKey || event.metaKey) {
                dispatch(selectingDataActions.selectAllSelectableObjects());
              }
              break;
            default: {
              break;
            }
          }
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // input 입력 중에는 적용되지 않도록 수정
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      switch (event.key) {
        case 'v':
        case 'V':
        case 'ㅍ':
        case 'r':
        case 'R':
        case 'ㄱ':
        case 'k':
        case 'K':
        case 'ㅏ':
        case 'f':
        case 'F':
        case 'ㄹ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        default: {
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [_screenList, dispatch, multiKeyController, prevCameraPositions, prevCameraTargets]);

  /**
   * edit keyframe 단축키
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      switch (event.key) {
        case 'v':
        case 'V':
        case 'ㅍ': // v (viewport)
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          break;
        case 'k':
        case 'K':
        case 'ㅏ': // insert
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          if (multiKeyController[event.key].pressed) {
            // v를 누르지 않고 k
            if (!multiKeyController.v.pressed && !multiKeyController.V.pressed && !multiKeyController.ㅍ.pressed) {
              dispatch(animationDataActions.editKeyframes());
            }
          }
          break;
        default: {
          break;
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      switch (event.key) {
        case 'v':
        case 'V':
        case 'ㅍ':
        case 'k':
        case 'K':
        case 'ㅏ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        default: {
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [dispatch, multiKeyController]);

  /******************************************************************************
   * 기존 useGizmoControl의 내용
   *****************************************************************************/
  const [gizmoManager, setGizmoManager] = useState<BABYLON.GizmoManager>();
  const [currentGizmoMode, setCurrentGizmoMode] = useState<GizmoMode>('position');
  const [currentGizmoCoordinate, setCurrentGizmoCoordinate] = useState<'world' | 'local'>('local');

  /**
   * selectedTargets 기준으로 property tracks 필터링
   */
  const isMountRef = useRef(true);
  useEffect(() => {
    if (!isMountRef.current) {
      dispatch(trackListActions.changeSelectedTargets());
    } else {
      isMountRef.current = false;
    }
  }, [dispatch, _selectedTargets]);

  /**
   * 선택 대상 변경에 따른 gizmo attach
   * gizmo control에 커스터마이징 내용 포함
   */
  useEffect(() => {
    // Here was Gizmo code, keeping this for the referencies to see where we should hook it (_selectedTargets)
  }, [_screenList, _selectedTargets, _visibilityOptions, currentGizmoMode, gizmoManager]);

  /**
   * gizmo coordinate에 따른 gizmoManager 설졍 변경
   */
  useEffect(() => {
    if (gizmoManager) {
      if (currentGizmoMode === 'position') {
        gizmoManager.gizmos.positionGizmo!.updateGizmoPositionToMatchAttachedMesh = currentGizmoCoordinate === 'local';
        gizmoManager.gizmos.positionGizmo!.updateGizmoRotationToMatchAttachedMesh = currentGizmoCoordinate === 'local';
      } else if (currentGizmoMode === 'rotation') {
        gizmoManager.gizmos.rotationGizmo!.updateGizmoPositionToMatchAttachedMesh = currentGizmoCoordinate === 'local';
        gizmoManager.gizmos.rotationGizmo!.updateGizmoRotationToMatchAttachedMesh = currentGizmoCoordinate === 'local';
      }
    }
  }, [currentGizmoCoordinate, currentGizmoMode, gizmoManager]);

  /**
   * gizmoManager 관련 단축키 설정
   */
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // input 입력 중에는 적용되지 않도록 수정
      const target = event.target as Element;
      if (target.tagName.toLowerCase() === 'input') {
        return;
      }

      switch (event.key) {
        case '`':
        case '₩': {
          setCurrentGizmoCoordinate((prev) => (prev === 'world' ? 'local' : 'world'));
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
  }, []);

  /******************************************************************************
   * 기존 useAnimation의 내용
   *****************************************************************************/

  /**
   * 애니메이션 생성
   */
  useEffect(() => {
    const visualizedAnimationIngredients = _animationIngredients.filter(
      (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    if (visualizedAnimationIngredients.length === 1) {
      // useFilter 실제로는 false로 주고, 재생시에만 true이도록 변경해야 함
      const newAnimationGroup = createAnimationGroupFromIngredient(visualizedAnimationIngredients[0], _fps);

      newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);

      dispatch(animatingControlsActions.setCurrentAnimationGroup({ animationGroup: newAnimationGroup }));

      return () => {
        newAnimationGroup.stop();
      };
    }
  }, [_animationIngredients, _endTimeIndex, _fps, _startTimeIndex, _visualizedAssetIds, dispatch]);

  /******************************************************************************
   * RP 내 하위 컨테이너들에 대한 내용
   * contextMenu, dropDown
   *****************************************************************************/

  /**
   * contextMenu 사용
   */

  const transformChildren = useMemo(
    () => [
      {
        label: 'Position',
        disabled: currentGizmoMode === 'position',
        onClick: () => {
          if (gizmoManager) {
            setCurrentGizmoMode('position');
            gizmoManager.positionGizmoEnabled = true;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = false;
          }
        },
      },
      {
        label: 'Rotation',
        disabled: currentGizmoMode === 'rotation',
        onClick: () => {
          if (gizmoManager) {
            setCurrentGizmoMode('rotation');
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = true;
            gizmoManager.scaleGizmoEnabled = false;
          }
        },
      },
      {
        label: 'Scale',
        disabled: currentGizmoMode === 'scale',
        onClick: () => {
          if (gizmoManager) {
            setCurrentGizmoMode('scale');
            gizmoManager.positionGizmoEnabled = false;
            gizmoManager.rotationGizmoEnabled = false;
            gizmoManager.scaleGizmoEnabled = true;
          }
        },
      },
    ],
    [currentGizmoMode, gizmoManager],
  );

  const orientChildren = useMemo(
    () => [
      {
        label: 'World',
        disabled: currentGizmoCoordinate === 'world',
        onClick: () => {
          setCurrentGizmoCoordinate('world');
        },
      },
      {
        label: 'Local',
        disabled: currentGizmoCoordinate === 'local',
        onClick: () => {
          setCurrentGizmoCoordinate('local');
        },
      },
    ],
    [currentGizmoCoordinate],
  );

  const contextMenuList = useMemo(
    () => [
      {
        label: 'Select all',
        onClick: () => {
          dispatch(selectingDataActions.selectAllSelectableObjects());
        },
      },
      {
        label: 'Unselect all',
        disabled: _selectedTargets.length === 0,
        onClick: () => {
          dispatch(selectingDataActions.resetSelectedTargets());
        },
        separator: true,
      },
      {
        label: 'Transform',
        children: transformChildren,
      },
      {
        label: 'Orient',
        separator: true,
        children: orientChildren,
      },
      {
        label: 'Camera reset',
        onClick: () => {
          document.getElementById('renderingCanvas1')?.focus();
          const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
          if (focusedCanvas) {
            const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
            const focusedScene = focusedPlaskScreen?.scene;
            if (focusedScene && focusedScene.activeCamera) {
              const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
              if (activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
                activeCamera.orthoTop = 2;
                activeCamera.orthoBottom = -2;
                activeCamera.orthoLeft = -2 * (focusedCanvas!.width / focusedCanvas!.height);
                activeCamera.orthoRight = 2 * (focusedCanvas!.width / focusedCanvas!.height);

                const grounds = focusedScene.getMeshesByTags('ground');
                const visibleGround = grounds.find((ground) => ground.isVisible);
                if (visibleGround) {
                  const currentView = visibleGround.id.split('//')[1];
                  const defaultPosition = BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY);
                  const defaultTarget = BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY);

                  let distance: number;

                  if (currentView === 'front') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, defaultPosition.z), new BABYLON.Vector3(0, 0, defaultTarget.z));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, defaultTarget.y, distance + 10));
                  } else if (currentView === 'back') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, defaultPosition.z), new BABYLON.Vector3(0, 0, defaultTarget.z));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, defaultTarget.y, -(distance + 10)));
                  } else if (currentView === 'top') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, defaultPosition.y, 0), new BABYLON.Vector3(0, defaultTarget.y, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, distance + 10, defaultTarget.z));
                  } else if (currentView === 'bottom') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, defaultPosition.y, 0), new BABYLON.Vector3(0, defaultTarget.y, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(defaultTarget.x, -(distance + 10), defaultTarget.z));
                  } else if (currentView === 'left') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(defaultPosition.x, 0, 0), new BABYLON.Vector3(defaultTarget.x, 0, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(-(distance + 10), defaultTarget.y, defaultTarget.z));
                  } else if (currentView === 'right') {
                    distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(defaultPosition.x, 0, 0), new BABYLON.Vector3(defaultTarget.x, 0, 0));
                    activeCamera.setPosition(new BABYLON.Vector3(distance + 10, defaultTarget.y, defaultTarget.z));
                  }
                  activeCamera.setTarget(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY));
                }
              } else if (activeCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                activeCamera.setPosition(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY));
                activeCamera.setTarget(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY));
              }
            }
          }
        },
      },
      {
        label: 'View',
        separator: true,
        children: [
          {
            label: 'Perspective',
            onClick: () => {
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  if (activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                    const prevCameraPosition = prevCameraPositions[focusedCanvas.id]?.clone();
                    const prevCameraTarget = prevCameraTargets[focusedCanvas.id]?.clone();
                    if (prevCameraPosition && prevCameraTarget) {
                      activeCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
                      activeCamera.setPosition(prevCameraPosition);
                      activeCamera.setTarget(prevCameraTarget);

                      prevCameraPositions[focusedCanvas.id] = null;
                      prevCameraTargets[focusedCanvas.id] = null;
                    }

                    const grounds = focusedScene.getMeshesByTags('ground');
                    grounds.forEach((ground) => {
                      if (ground.id.split('//')[1] === 'top') {
                        ground.isVisible = true;
                      } else {
                        ground.isVisible = false;
                      }
                    });
                  }
                }
              }
            },
          },
          {
            label: 'Front',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'front');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                  activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, distance + 10));
                }
              }
            },
          },
          {
            label: 'Back',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'back');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                  activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, -(distance + 10)));
                }
              }
            },
          },
          {
            label: 'Top',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'top');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
                  activeCamera.setPosition(new BABYLON.Vector3(target.x, distance + 10, target.z));
                }
              }
            },
          },
          {
            label: 'Bottom',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'bottom');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
                  activeCamera.setPosition(new BABYLON.Vector3(target.x, -(distance + 10), target.z));
                }
              }
            },
          },
          {
            label: 'Right',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;
                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'right');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
                  activeCamera.setPosition(new BABYLON.Vector3(distance + 10, target.y, target.z));
                }
              }
            },
          },
          {
            label: 'Left',
            onClick: () => {
              const switchToOrthoGraphic = (canvas: HTMLCanvasElement, camera: BABYLON.ArcRotateCamera, scene: BABYLON.Scene, view: PlaskView) => {
                camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
                camera.orthoTop = 2;
                camera.orthoBottom = -2;
                camera.orthoLeft = -2 * (canvas.width / canvas.height);
                camera.orthoRight = 2 * (canvas.width / canvas.height);

                const grounds = scene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id.split('//')[1] === view) {
                    ground.isVisible = true;
                  } else {
                    ground.isVisible = false;
                  }
                });
              };
              document.getElementById('renderingCanvas1')?.focus();
              const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
              if (focusedCanvas) {
                const focusedPlaskScreen = _screenList.find((screen) => screen.canvasId === focusedCanvas.id);
                const focusedScene = focusedPlaskScreen?.scene;
                if (focusedScene && focusedScene.activeCamera) {
                  const activeCamera = focusedScene.activeCamera as BABYLON.ArcRotateCamera;
                  const { position, target } = activeCamera;

                  switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'left');

                  if (!prevCameraPositions[focusedCanvas.id] && !prevCameraTargets[focusedCanvas.id]) {
                    prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                    prevCameraTargets[focusedCanvas.id] = activeCamera.target.clone();
                  }

                  const distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(position.x, 0, 0), new BABYLON.Vector3(target.x, 0, 0));
                  activeCamera.setPosition(new BABYLON.Vector3(-(distance + 10), target.y, target.z));
                }
              }
            },
          },
        ],
      },
      {
        label: 'Insert keyframe',
        disabled: _selectedTargets.length === 0 || _playState === 'play',
        onClick: () => {
          if (!(_selectedTargets.length === 0 || _playState === 'play')) {
            dispatch(animationDataActions.editKeyframes());
          }
        },
      },
    ],
    [_playState, _screenList, _selectedTargets.length, dispatch, orientChildren, transformChildren, prevCameraPositions, prevCameraTargets],
  );

  useEffect(() => {
    const targetScreen = _screenList.find((screen) => screen.canvasId === renderingCanvas1.current?.id); // 단일 캔버스 상황

    if (targetScreen) {
      const { scene } = targetScreen;

      const contextMenuObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
        // camera panning 시에는 발생하지 않도록하기 위함
        if (pointerInfo.event.button === 2 && !pointerInfo.event.altKey) {
          switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN: {
              onContextMenuClose();
              onContextMenuOpen({ top: scene.pointerY, left: scene.pointerX, menu: contextMenuList });
              break;
            }
          }
        }
      });

      return () => {
        scene.onPointerObservable.remove(contextMenuObserver);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_screenList, contextMenuList]);

  /**
   * screenVisibilityMenu
   */
  // skeletonViewer는 단순 debug용이기 때문에 visualizedAsset이 변화될 때마다 생성하도록 변경
  useEffect(() => {
    const targetScreen = _screenList[0];
    const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
    if (targetScreen && visualizedAsset) {
      const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === targetScreen.id);
      const { skeleton, meshes } = visualizedAsset;
      const skeletonViewer = new BABYLON.SkeletonViewer(skeleton, meshes[0], targetScreen.scene, true, meshes[0].renderingGroupId, DEFAULT_SKELETON_VIEWER_OPTION);
      skeletonViewer.mesh.id = `${visualizedAsset.id}//skeletonViewer`;
      if (targetVisibilityOption) {
        skeletonViewer.isEnabled = targetVisibilityOption.isBoneVisible;
      }
      dispatch(screenDataActions.addSkeletonViewer({ screenId: targetScreen.id, skeletonViewer: skeletonViewer }));

      return () => {
        skeletonViewer.dispose();
        dispatch(screenDataActions.removeSkeletonViewer({ screenId: targetScreen.id }));
        // setSkeletonViewer(null);
      };
    }
  }, [_assetList, _screenList, _visibilityOptions, _visualizedAssetIds, dispatch]);

  const screenVisibilityItemList: ScreenVisivilityItem[] = useMemo(() => {
    const targetScreen = _screenList[0];
    if (targetScreen) {
      const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === targetScreen.id);
      const targetSkeletonViewer = _plaskSkeletonViewers.find((plaskSkeletonViewer) => plaskSkeletonViewer.screenId === targetScreen.id)?.skeletonViewer;

      return [
        {
          value: 'Bone',
          onSelect: () => {
            if (targetVisibilityOption) {
              if (targetVisibilityOption.isBoneVisible) {
                const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
                if (visualizedAsset) {
                  const { id: assetId, meshes, skeleton } = visualizedAsset;
                  // joints
                  const transformNodes = _selectableObjects.filter((object) => !checkIsTargetMesh(object) && object.id.includes(assetId)) as BABYLON.TransformNode[];
                  transformNodes.forEach((transformNode) => {
                    const joint = targetScreen.scene.getMeshById(transformNode.id.replace('transformNode', 'joint'));
                    if (joint) {
                      joint.isVisible = false;
                    }
                  });
                  // skeletonView
                  if (targetSkeletonViewer) {
                    targetSkeletonViewer.isEnabled = false;
                  }
                }

                dispatch(screenDataActions.setBoneVisibility({ screenId: targetScreen.id, value: false }));
              } else {
                const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
                if (visualizedAsset) {
                  const { id: assetId, meshes, skeleton } = visualizedAsset;
                  // joints
                  const transformNodes = _selectableObjects.filter((object) => !checkIsTargetMesh(object) && object.id.includes(assetId)) as BABYLON.TransformNode[];
                  transformNodes.forEach((transformNode) => {
                    const joint = targetScreen.scene.getMeshById(transformNode.id.replace('transformNode', 'joint'));
                    if (joint) {
                      joint.isVisible = true;
                    }
                  });
                  // skeletonView
                  if (targetSkeletonViewer) {
                    targetSkeletonViewer.isEnabled = true;
                  }
                }

                dispatch(screenDataActions.setBoneVisibility({ screenId: targetScreen.id, value: true }));
              }
            }
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true,
          active: targetVisibilityOption && !targetVisibilityOption.isMeshVisible ? false : true,
        },
        {
          value: 'Mesh',
          onSelect: () => {
            if (targetVisibilityOption) {
              if (targetVisibilityOption.isMeshVisible) {
                const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
                if (visualizedAsset) {
                  visualizedAsset.meshes.forEach((mesh) => {
                    if (mesh.getScene().uid === targetScreen.id) {
                      mesh.isVisible = false;
                    }
                  });
                }

                dispatch(screenDataActions.setMeshVisibility({ screenId: targetScreen.id, value: false }));
              } else {
                const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
                if (visualizedAsset) {
                  visualizedAsset.meshes.forEach((mesh) => {
                    if (mesh.getScene().uid === targetScreen.id) {
                      mesh.isVisible = true;
                    }
                  });
                }

                dispatch(screenDataActions.setMeshVisibility({ screenId: targetScreen.id, value: true }));
              }
            }
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isMeshVisible : true,
          active: targetVisibilityOption && !targetVisibilityOption.isBoneVisible ? false : true,
        },
        // {
        //   value: 'Controller',
        //   onSelect: () => {
        //     if (targetVisibilityOption) {
        //       if (targetVisibilityOption.isControllerVisible) {
        //         const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
        //         if (visualizedAsset) {
        //           const controllers = _selectableObjects.filter((object) => object.id.includes(visualizedAsset.id) && checkIsTargetMesh(object)) as BABYLON.Mesh[];
        //           controllers.forEach((controller) => {
        //             if (controller.getScene().uid === targetScreen.id) {
        //               controller.isVisible = false;
        //             }
        //           });
        //         }

        //         dispatch(screenDataActions.setControllerVisibility({ screenId: targetScreen.id, value: false }));
        //       } else {
        //         const visualizedAsset = _assetList.find((asset) => _visualizedAssetIds.includes(asset.id));
        //         if (visualizedAsset) {
        //           const controllers = _selectableObjects.filter((object) => object.id.includes(visualizedAsset.id) && checkIsTargetMesh(object)) as BABYLON.Mesh[];
        //           controllers.forEach((controller) => {
        //             if (controller.getScene().uid === targetScreen.id) {
        //               controller.isVisible = true;
        //             }
        //           });
        //         }

        //         dispatch(screenDataActions.setControllerVisibility({ screenId: targetScreen.id, value: true }));
        //       }
        //     }
        //   },
        //   checked: targetVisibilityOption ? targetVisibilityOption.isControllerVisible : true,
        //   active: true,
        // },
        {
          value: 'Gizmo',
          onSelect: () => {
            if (targetVisibilityOption) {
              if (targetVisibilityOption.isGizmoVisible) {
                dispatch(screenDataActions.setGizmoVisibility({ screenId: targetScreen.id, value: false }));
              } else {
                dispatch(screenDataActions.setGizmoVisibility({ screenId: targetScreen.id, value: true }));
              }
            }
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isGizmoVisible : true,
          active: true,
        },
      ];
    } else {
      return [];
    }
  }, [_assetList, _plaskSkeletonViewers, _screenList, _selectableObjects, _visibilityOptions, _visualizedAssetIds, dispatch]);

  return (
    <div className={cx('wrapper')}>
      <div id="rpDragBox" ref={rpDragBox}></div>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
      <ScreenVisibility itemList={screenVisibilityItemList} />
    </div>
  );
};

export default RenderingPanel;
