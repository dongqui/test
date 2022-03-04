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
import { useSelector } from 'reducers';
import { Nullable, ScreenXY, PlaskView } from 'types/common';
import { ScreenVisivilityItem } from 'types/RP';
import { DEFAULT_SKELETON_VIEWER_OPTION } from 'utils/const';
import { checkIsTargetMesh, createAnimationGroupFromIngredient } from 'utils/RP';
import ScreenVisibility from './ScreenVisibility';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { BabylonContext } from 'contexts/RP/BabylonContext';
import { useObserved } from 'hooks/common/useObserved';

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
   * object to handle multi-key
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
   * Initiate Babylon stuff.
   * Create engine, scene.
   * Add default settings including a camera, grounds and etc.
   *****************************************************************************/

  /**
   * create scece and add default settings
   */
  const { plaskEngine } = useContext(BabylonContext);

  useEffect(() => {
    if (renderingCanvas1.current) {
      // Initialize Plask engine
      // ? Can we have several canvas/engine ? -> @kenny not now, but multi-canvas environmnet will be handled later
      plaskEngine.initialize(renderingCanvas1.current);

      // create an observable that observes scene's readiness
      // and add callback to it
      plaskEngine.scene.onReadyObservable.addOnce(() => {
        // register new scene(screen) to the reducer
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

      // plaskEngine.scene.onDisposeObservable.addOnce((scene) => {
      //   // reload window when scene is disposed -> only used in dev environment for better DX
      //   // window.location.reload();
      // });

      const targetNode = document.getElementById('RP')!; // always exist
      const config = { attributes: true };

      const handleEngineResize = () => {
        plaskEngine.resize();
      };

      const resizeMutationObserver = new MutationObserver(handleEngineResize);

      resizeMutationObserver.observe(targetNode, config);
      return () => {
        // dispose engine when component is unrendered
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
   * dragBox interacting with scene
   */
  const rpDragBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Check with Kenny how we can handle these screens -> @kenny use the first screen cause we only support only one canvas now
    const targetScreen = _screenList[0];

    if (targetScreen) {
      const dragBox = rpDragBox.current as HTMLDivElement;
      const dragBoxDefaultStyle = 'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
      dragBox.setAttribute('style', dragBoxDefaultStyle);

      // TODO : export logic inside a module
      plaskEngine.selectorModule.selectableObjects = _selectableObjects;
      // DragBox updated
      const selectBoxUpdatedObserver = plaskEngine.selectorModule.onSelectBoxUpdated.add(({ min, max }) => {
        dragBox.setAttribute('style', `${dragBoxDefaultStyle} left: ${min.x}px; top: ${min.y}px; width: ${max.x - min.x}px; height: ${max.y - min.y}px;`);
      });

      // DragBox end
      const endSelectBoxObserver = plaskEngine.selectorModule.onEndSelectBox.add(({ type, objects }) => {
        if (type === 'ctrlKey') {
          dispatch(selectingDataActions.ctrlKeyMultiSelect({ targets: objects }));
        } else {
          dispatch(selectingDataActions.defaultMultiSelect({ targets: objects }));
        }
        dragBox.setAttribute('style', dragBoxDefaultStyle);
      });

      return () => {
        plaskEngine.selectorModule.onSelectBoxUpdated.remove(selectBoxUpdatedObserver);
        plaskEngine.selectorModule.onEndSelectBox.remove(endSelectBoxObserver);
      };
    }
  }, [_screenList, _selectableObjects, dispatch, plaskEngine]);

  /**
   * shortcuts related to camera navigation, viewport changes
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
      // shortcuts don't work while user is typing on input elements
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
                // k with v
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
      // shortcuts don't work while user is typing on input elements
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
   * shortcuts related to editing keyframes
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
            // k with v not pressed
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
   * About GizmoControls
   *****************************************************************************/
  const [gizmoManager, setGizmoManager] = useState<BABYLON.GizmoManager>();
  const [currentGizmoMode, setCurrentGizmoMode] = useState<GizmoMode>('position');
  const [currentGizmoCoordinate, setCurrentGizmoCoordinate] = useState<'world' | 'local'>('local');

  /**
   * create gizmoManager
   */
  useEffect(() => {
    const baseScreen = _screenList[0];
    if (baseScreen && baseScreen.scene) {
      const innerGizmoManager = new BABYLON.GizmoManager(baseScreen.scene);

      setGizmoManager(innerGizmoManager);
      innerGizmoManager.usePointerToAttachGizmos = false;
      innerGizmoManager.positionGizmoEnabled = true; // set position to its default mode
    }
  }, [_screenList]);

  /**
   * select property tracks in TimelinePanel(TP) according to the selected targets in RenderingPanel(RP)
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
   * attach gizmo to the selected target (only support single target now)
   * (including selecting effects and custom cursor)
   */
  useEffect(() => {
    const targetScreen = _screenList[0];
    const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === targetScreen?.id);

    // selecting effects (white outline)
    _selectedTargets.forEach((target) => {
      if (checkIsTargetMesh(target)) {
        // when the target is controller
        target.renderOutline = true;
        target.outlineColor = BABYLON.Color3.White();
        target.outlineWidth = 0.1;
      } else {
        // when the target is transformNode
        const joint = target.getScene().getMeshById(target.id.replace('transformNode', 'joint'));
        if (joint) {
          joint.renderOutline = true;
          joint.outlineColor = BABYLON.Color3.White();
          joint.outlineWidth = 0.3 * (parseFloat(joint.state) / 3); // set outline width according to joint's diameter
        }
      }
    });

    if (gizmoManager && targetVisibilityOption) {
      if (_selectedTargets.length === 0) {
        // case nothing selected
        gizmoManager.attachToNode(null);
      } else if (_selectedTargets.length === 1) {
        // case single target selected
        switch (currentGizmoMode) {
          // set gizmo mode according to the currentGizmoMode state
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
        if (targetVisibilityOption.isGizmoVisible) {
          if (!checkIsTargetMesh(_selectedTargets[0])) {
            // case single transformNode selected
            gizmoManager.attachToNode(_selectedTargets[0]);

            return () => {
              // selecting effect off
              const target = _selectedTargets[0];
              if (checkIsTargetMesh(target)) {
                // controller
                target.renderOutline = false;
              } else {
                // transformNode
                const joint = target.getScene().getMeshById(target.id.replace('transformNode', 'joint'));
                if (joint) {
                  joint.renderOutline = false;
                }
              }
            };
          }
          // } else if (_selectedTargets[0].getClassName() === 'Mesh') {
          //   // case sing controller selected -> @kenny fk controller is not included in current version of Plask
          //   gizmoManager.attachToMesh(_selectedTargets[0] as BABYLON.Mesh);

          //   const linkedTransformNode = _selectedTargets[0].getScene().getTransformNodeById(_selectedTargets[0].id.replace('controller', 'transformNode'));

          //   const addPositionDragObservable = (target: BABYLON.TransformNode, gizmo: BABYLON.AxisDragGizmo) => {
          //     return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
          //       target.setAbsolutePosition(new BABYLON.Vector3(target.absolutePosition.x + delta.x, target.absolutePosition.y + delta.y, target.absolutePosition.z + delta.z));
          //     });
          //   };

          //   const addScaleDragObservable = (target: BABYLON.TransformNode, gizmo: BABYLON.AxisScaleGizmo) => {
          //     return gizmo.dragBehavior.onDragObservable.add(({ delta }) => {
          //       target.scaling = new BABYLON.Vector3(target.scaling.x + delta.x, target.scaling.y + delta.y, target.scaling.z + delta.z);
          //     });
          //   };

          //   // controller 부착 시의 gizmo control customize
          //   if (linkedTransformNode) {
          //     if (gizmoManager.positionGizmoEnabled && currentGizmoMode === 'position') {
          //       const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.positionGizmo!;
          //       const xPositionDragObservable = addPositionDragObservable(linkedTransformNode, xGizmo);
          //       const yPositionDragObservable = addPositionDragObservable(linkedTransformNode, yGizmo);
          //       const zPositionDragObservable = addPositionDragObservable(linkedTransformNode, zGizmo);

          //       return () => {
          //         // observable 제거
          //         xGizmo.dragBehavior.onDragObservable.remove(xPositionDragObservable);
          //         yGizmo.dragBehavior.onDragObservable.remove(yPositionDragObservable);
          //         zGizmo.dragBehavior.onDragObservable.remove(zPositionDragObservable);

          //         // 선택효과 해제
          //         const target = _selectedTargets[0];
          //         if (checkIsTargetMesh(target)) {
          //           // 컨트롤러
          //           target.renderOutline = false;
          //         } else {
          //           // joint
          //           const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
          //           if (joint) {
          //             joint.renderOutline = false;
          //           }
          //         }
          //       };
          //     } else if (gizmoManager.rotationGizmoEnabled && currentGizmoMode === 'rotation') {
          //       const lastDragPosition = new BABYLON.Vector3();
          //       const rotationMatrix = new BABYLON.Matrix();
          //       const planeNormalTowardsCamera = new BABYLON.Vector3();
          //       let localPlaneNormalTowardsCamera = new BABYLON.Vector3();
          //       let currentSnapDragDistance = 0;
          //       const tmpMatrix = new BABYLON.Matrix();
          //       const amountToRotate = new BABYLON.Quaternion();

          //       const xRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
          //         // set drag start point as lastDragPosition
          //         lastDragPosition.copyFrom(dragPlanePoint);
          //       });

          //       const xRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.add(({ dragPlanePoint, dragDistance }) => {
          //         // decompose the world matrix of the linkedTransformNode
          //         const nodeScale = new BABYLON.Vector3(1, 1, 1);
          //         const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
          //         const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
          //         linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

          //         const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
          //         const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

          //         const cross = BABYLON.Vector3.Cross(newVector, originalVector);
          //         const dot = BABYLON.Vector3.Dot(newVector, originalVector);

          //         // cross.length() can be the reason of the bug
          //         let angle = Math.atan2(cross.length(), dot);

          //         const planeNormal = new BABYLON.Vector3(1, 0, 0);
          //         planeNormalTowardsCamera.copyFrom(planeNormal);
          //         localPlaneNormalTowardsCamera.copyFrom(planeNormal);
          //         if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //           nodeQuaternion.toRotationMatrix(rotationMatrix);
          //           localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
          //         }

          //         // Flip up vector depending on which side the camera is on
          //         let cameraFlipped = false;
          //         if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
          //           var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
          //           if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
          //             planeNormalTowardsCamera.scaleInPlace(-1);
          //             localPlaneNormalTowardsCamera.scaleInPlace(-1);
          //             cameraFlipped = true;
          //           }
          //         }
          //         var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
          //         if (halfCircleSide) {
          //           angle = -angle;
          //         }
          //         if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
          //           currentSnapDragDistance += angle;
          //           if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
          //             let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
          //             if (currentSnapDragDistance < 0) {
          //               dragSteps *= -1;
          //             }
          //             currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
          //             angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
          //           } else {
          //             angle = 0;
          //           }
          //         }

          //         dragDistance += cameraFlipped ? -angle : angle;

          //         const quaternionCoefficient = Math.sin(angle / 2);
          //         amountToRotate.set(
          //           planeNormalTowardsCamera.x * quaternionCoefficient,
          //           planeNormalTowardsCamera.y * quaternionCoefficient,
          //           planeNormalTowardsCamera.z * quaternionCoefficient,
          //           Math.cos(angle / 2),
          //         );

          //         if (tmpMatrix.determinant() > 0) {
          //           const tmpVector = new BABYLON.Vector3();
          //           amountToRotate.toEulerAnglesToRef(tmpVector);
          //           BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
          //         }
          //         if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //           nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
          //         } else {
          //           amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
          //         }
          //         linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
          //         lastDragPosition.copyFrom(dragPlanePoint);
          //       });

          //       const yRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
          //         // set drag start point as lastDragPosition
          //         lastDragPosition.copyFrom(dragPlanePoint);
          //       });

          //       const yRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.add(
          //         ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
          //           // decompose the world matrix of the linkedTransformNode
          //           const nodeScale = new BABYLON.Vector3(1, 1, 1);
          //           const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
          //           const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
          //           linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

          //           const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
          //           const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

          //           const cross = BABYLON.Vector3.Cross(newVector, originalVector);
          //           const dot = BABYLON.Vector3.Dot(newVector, originalVector);

          //           // cross.length() can be the reason of the bug
          //           let angle = Math.atan2(cross.length(), dot);

          //           const planeNormal = new BABYLON.Vector3(0, 1, 0);
          //           planeNormalTowardsCamera.copyFrom(planeNormal);
          //           localPlaneNormalTowardsCamera.copyFrom(planeNormal);
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //             nodeQuaternion.toRotationMatrix(rotationMatrix);
          //             localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
          //           }

          //           // Flip up vector depending on which side the camera is on
          //           let cameraFlipped = false;
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
          //             var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
          //             if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
          //               planeNormalTowardsCamera.scaleInPlace(-1);
          //               localPlaneNormalTowardsCamera.scaleInPlace(-1);
          //               cameraFlipped = true;
          //             }
          //           }
          //           var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
          //           if (halfCircleSide) {
          //             angle = -angle;
          //           }
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
          //             currentSnapDragDistance += angle;
          //             if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
          //               let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
          //               if (currentSnapDragDistance < 0) {
          //                 dragSteps *= -1;
          //               }
          //               currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
          //               angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
          //             } else {
          //               angle = 0;
          //             }
          //           }

          //           dragDistance += cameraFlipped ? -angle : angle;

          //           const quaternionCoefficient = Math.sin(angle / 2);
          //           amountToRotate.set(
          //             planeNormalTowardsCamera.x * quaternionCoefficient,
          //             planeNormalTowardsCamera.y * quaternionCoefficient,
          //             planeNormalTowardsCamera.z * quaternionCoefficient,
          //             Math.cos(angle / 2),
          //           );

          //           if (tmpMatrix.determinant() > 0) {
          //             const tmpVector = new BABYLON.Vector3();
          //             amountToRotate.toEulerAnglesToRef(tmpVector);
          //             BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
          //           }
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //             nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
          //           } else {
          //             amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
          //           }
          //           linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
          //           lastDragPosition.copyFrom(dragPlanePoint);
          //         },
          //       );

          //       const zRotationDragStartObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.add(({ dragPlanePoint, pointerId }) => {
          //         // set drag start point as lastDragPosition
          //         lastDragPosition.copyFrom(dragPlanePoint);
          //       });

          //       const zRotationDragObservable = gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.add(
          //         ({ delta, dragPlanePoint, dragPlaneNormal, dragDistance, pointerId }) => {
          //           // decompose the world matrix of the linkedTransformNode
          //           const nodeScale = new BABYLON.Vector3(1, 1, 1);
          //           const nodeQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);
          //           const nodeTranslation = new BABYLON.Vector3(0, 0, 0);
          //           linkedTransformNode.getWorldMatrix().decompose(nodeScale, nodeQuaternion, nodeTranslation);

          //           const newVector = dragPlanePoint.subtract(nodeTranslation).normalize();
          //           const originalVector = lastDragPosition.subtract(nodeTranslation).normalize();

          //           const cross = BABYLON.Vector3.Cross(newVector, originalVector);
          //           const dot = BABYLON.Vector3.Dot(newVector, originalVector);

          //           // cross.length() can be the reason of the bug
          //           let angle = Math.atan2(cross.length(), dot);

          //           const planeNormal = new BABYLON.Vector3(0, 0, 1);
          //           planeNormalTowardsCamera.copyFrom(planeNormal);
          //           localPlaneNormalTowardsCamera.copyFrom(planeNormal);
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //             nodeQuaternion.toRotationMatrix(rotationMatrix);
          //             localPlaneNormalTowardsCamera = BABYLON.Vector3.TransformCoordinates(planeNormalTowardsCamera, rotationMatrix);
          //           }

          //           // Flip up vector depending on which side the camera is on
          //           let cameraFlipped = false;
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera) {
          //             var camVec = gizmoManager.gizmos.rotationGizmo!.xGizmo.gizmoLayer.utilityLayerScene.activeCamera.position.subtract(nodeTranslation);
          //             if (BABYLON.Vector3.Dot(camVec, localPlaneNormalTowardsCamera) > 0) {
          //               planeNormalTowardsCamera.scaleInPlace(-1);
          //               localPlaneNormalTowardsCamera.scaleInPlace(-1);
          //               cameraFlipped = true;
          //             }
          //           }
          //           var halfCircleSide = BABYLON.Vector3.Dot(localPlaneNormalTowardsCamera, cross) > 0.0;
          //           if (halfCircleSide) {
          //             angle = -angle;
          //           }
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance !== 0) {
          //             currentSnapDragDistance += angle;
          //             if (Math.abs(currentSnapDragDistance) > gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance) {
          //               let dragSteps = Math.floor(Math.abs(currentSnapDragDistance) / gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance);
          //               if (currentSnapDragDistance < 0) {
          //                 dragSteps *= -1;
          //               }
          //               currentSnapDragDistance = currentSnapDragDistance % gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance;
          //               angle = gizmoManager.gizmos.rotationGizmo!.xGizmo.snapDistance * dragSteps;
          //             } else {
          //               angle = 0;
          //             }
          //           }

          //           dragDistance += cameraFlipped ? -angle : angle;

          //           const quaternionCoefficient = Math.sin(angle / 2);
          //           amountToRotate.set(
          //             planeNormalTowardsCamera.x * quaternionCoefficient,
          //             planeNormalTowardsCamera.y * quaternionCoefficient,
          //             planeNormalTowardsCamera.z * quaternionCoefficient,
          //             Math.cos(angle / 2),
          //           );

          //           if (tmpMatrix.determinant() > 0) {
          //             const tmpVector = new BABYLON.Vector3();
          //             amountToRotate.toEulerAnglesToRef(tmpVector);
          //             BABYLON.Quaternion.RotationYawPitchRollToRef(tmpVector.y, -tmpVector.x, -tmpVector.z, amountToRotate);
          //           }
          //           if (gizmoManager.gizmos.rotationGizmo!.xGizmo.updateGizmoRotationToMatchAttachedMesh) {
          //             nodeQuaternion.multiplyToRef(amountToRotate, nodeQuaternion);
          //           } else {
          //             amountToRotate.multiplyToRef(nodeQuaternion, nodeQuaternion);
          //           }
          //           linkedTransformNode.addRotation(2 * amountToRotate.x, 2 * amountToRotate.y, 2 * amountToRotate.z);
          //           lastDragPosition.copyFrom(dragPlanePoint);
          //         },
          //       );

          //       return () => {
          //         // observable 제거
          //         gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragStartObservable.remove(xRotationDragStartObservable);
          //         gizmoManager.gizmos.rotationGizmo!.xGizmo.dragBehavior.onDragObservable.remove(xRotationDragObservable);
          //         gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragStartObservable.remove(yRotationDragStartObservable);
          //         gizmoManager.gizmos.rotationGizmo!.yGizmo.dragBehavior.onDragObservable.remove(yRotationDragObservable);
          //         gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragStartObservable.remove(zRotationDragStartObservable);
          //         gizmoManager.gizmos.rotationGizmo!.zGizmo.dragBehavior.onDragObservable.remove(zRotationDragObservable);

          //         // 선택효과 해제
          //         const target = _selectedTargets[0];
          //         if (checkIsTargetMesh(target)) {
          //           // 컨트롤러
          //           target.renderOutline = false;
          //         } else {
          //           // joint
          //           const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
          //           if (joint) {
          //             joint.renderOutline = false;
          //           }
          //         }
          //       };
          //     } else if (gizmoManager.scaleGizmoEnabled && currentGizmoMode === 'scale') {
          //       const { xGizmo, yGizmo, zGizmo } = gizmoManager.gizmos.scaleGizmo!;

          //       const xScaleObservable = addScaleDragObservable(linkedTransformNode, xGizmo);
          //       const yScaleObservable = addScaleDragObservable(linkedTransformNode, yGizmo);
          //       const zScaleObservable = addScaleDragObservable(linkedTransformNode, zGizmo);

          //       return () => {
          //         // observable 제거
          //         xGizmo.dragBehavior.onDragObservable.remove(xScaleObservable);
          //         yGizmo.dragBehavior.onDragObservable.remove(yScaleObservable);
          //         zGizmo.dragBehavior.onDragObservable.remove(zScaleObservable);

          //         // 선택효과 해제
          //         const target = _selectedTargets[0];
          //         if (checkIsTargetMesh(target)) {
          //           // 컨트롤러
          //           target.renderOutline = false;
          //         } else {
          //           // joint
          //           const joint = target.getScene().getMeshByID(target.id.replace('transformNode', 'joint'));
          //           if (joint) {
          //             joint.renderOutline = false;
          //           }
          //         }
          //       };
          //     }
          //   }
          // }
        } else {
          gizmoManager.attachToNode(null);

          return () => {
            // off selecting effect
            const target = _selectedTargets[0];
            if (checkIsTargetMesh(target)) {
              // controller
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
      } else {
        // case multi targets are selected
        // not handled in the current version of Plask
        // @TODO handle gizmo in muti targets environment
        gizmoManager.attachToNode(null);

        const selectedTransformNodes = _selectedTargets.filter((target) => !checkIsTargetMesh(target)) as BABYLON.TransformNode[];
        const selectedControllers = _selectedTargets.filter((target) => checkIsTargetMesh(target)) as BABYLON.Mesh[];

        return () => {
          // off selecting effect
          _selectedTargets.forEach((target) => {
            if (checkIsTargetMesh(target)) {
              // controller
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
  }, [_screenList, _selectedTargets, _visibilityOptions, currentGizmoMode, gizmoManager]);

  /**
   * change gizmo's coordinate according to currnetGizmoCoordinate state
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
   * shortcuts related to the gizmoManager
   */
  useEffect(() => {
    if (gizmoManager) {
      const handleKeyDown = (event: KeyboardEvent) => {
        // shortcuts don't work while user is type in input elements
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

      // apply custom cursors
      const pointerObservable = gizmoManager.utilityLayer.utilityLayerScene.onPointerObservable.add((event) => {
        if (event.type === BABYLON.PointerEventTypes.POINTERDOWN) {
          if (event.pickInfo?.hit && event.pickInfo.pickedMesh && isTargetGizmoMesh(event.pickInfo.pickedMesh)) {
            isDragging = true;
          }
        } else if (event.type === BABYLON.PointerEventTypes.POINTERUP) {
          isDragging = false;
        } else if (event.type === BABYLON.PointerEventTypes.POINTERMOVE) {
          if (isDragging) {
            // cursors are not changed to default while user is dragging
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
            // check if the mouse is around the pickable mesh
            // if so, apply custom cursors
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
   * Animation related codes
   *****************************************************************************/

  /**
   * Create animationGroup and normalize it
   */
  useEffect(() => {
    const visualizedAnimationIngredients = _animationIngredients.filter(
      (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    if (visualizedAnimationIngredients.length === 1) {
      // @TODO need to change to apply filter only when the animationGroup is playing
      const newAnimationGroup = createAnimationGroupFromIngredient(visualizedAnimationIngredients[0], _fps);

      newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);

      dispatch(animatingControlsActions.setCurrentAnimationGroup({ animationGroup: newAnimationGroup }));

      return () => {
        newAnimationGroup.stop();
      };
    }
  }, [_animationIngredients, _endTimeIndex, _fps, _startTimeIndex, _visualizedAssetIds, dispatch]);

  /******************************************************************************
   * Related to RP's sub-containers
   * Including contextMenu and dropDown
   *****************************************************************************/

  /**
   * contextMenu
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
  // use skeletonViewer only for debugging purpose
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
