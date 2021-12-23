import * as BABYLON from '@babylonjs/core';
import { FunctionComponent, useRef, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as animatingControlsActions from 'actions/animatingControlsAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as trackListActions from 'actions/trackList';
import { useSelector } from 'reducers';
import { Nullable, ScreenXY, PlaskView } from 'types/common';
import {
  checkIsObjectIn,
  checkIsTargetMesh,
  createCamera,
  createDirectionalLight,
  createGrounds,
  createHemisphericLight,
  filterQuaternion,
  filterVector,
  getTotalTransformKeys,
} from 'utils/RP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

/**
 * consts
 */
const DEFAULT_CAMERA_POSITION_ARRAY = [0, 6, 10];
const DEFAULT_CAMERA_TARGET_ARRAY = [0, 0, 0];

/**
 * types and interfaces
 */
type PrevCameraPositions = {
  [key: string]: BABYLON.Vector3 | null;
};
type GizmoMode = 'position' | 'rotation' | 'scale';

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  /**
   * global states
   */
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _fps = useSelector((state) => state.plaskProject.fps);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  const dispatch = useDispatch();

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
      p: { pressed: false },
      P: { pressed: false },
      ㅔ: { pressed: false },
      h: { pressed: false },
      H: { pressed: false },
      ㅗ: { pressed: false },
    }),
    [],
  );

  /**
   * orthographic to perspective 카메라 전환 시 사용하는 마지막 카메라 위치
   */
  const prevCameraPositions: PrevCameraPositions = useMemo(() => ({}), []);

  /****************************************************************************
   * 기존 useInitializeScene의 내용
   * Babylon Engine과 Scene을 생성하고 Camera, Ground 등 렌더링 엔진의 기본요소를 설정합니다.
   *****************************************************************************/

  /**
   * scene 생성 및 기본 설정
   */
  useEffect(() => {
    // scene이 준비됐을 때 호출할 콜백
    const handleSceneReady = (scene: BABYLON.Scene) => {
      scene.useRightHandedSystem = true;
      scene.clearColor = BABYLON.Color4.FromColor3(BABYLON.Color3.FromHexString('#202020'));

      // scene에 기본요소를 생성합니다.
      const grounds = createGrounds(scene, true);

      const arcRotateCamera = createCamera(scene);

      const hemisphericLight = createHemisphericLight(scene);

      const directionalLight = createDirectionalLight(scene);
    };

    if (renderingCanvas1.current) {
      // matrix를 사용한 애니메이션 보간을 허용합니다.
      BABYLON.Animation.AllowMatricesInterpolation = true;
      const engine = new BABYLON.Engine(renderingCanvas1.current, true);
      const innerScene = new BABYLON.Scene(engine);

      prevCameraPositions[renderingCanvas1.current.id] = null;

      // scene의 생성과 소멸에 대한 observable을 생성하고 콜백을 추가합니다.
      innerScene.onReadyObservable.addOnce((scene) => {
        handleSceneReady(scene);
        // scene을 project reducer에 등록합니다.
        const newScreen = {
          id: innerScene.uid,
          name: renderingCanvas1.current!.id.replace('renderingCanvas', 'scene'),
          scene: innerScene,
          canvasId: renderingCanvas1.current!.id,
          hasShadow: true,
          hasGroundTexture: true,
        };
        dispatch(plaskProjectActions.addScreen({ screen: newScreen }));
      });

      innerScene.onDisposeObservable.addOnce((scene) => {
        // scene이 사라지면 창을 새로고침합니다.
        // window.location.reload();
      });

      innerScene.onPointerObservable.add((pointerInfo) => {
        const { pickInfo, type } = pointerInfo;
        if (type === BABYLON.PointerEventTypes.POINTERWHEEL) {
          const event = pointerInfo.event as WheelEvent & { wheelDelta: number };
          // orthographic 모드에서의 카메라 줌
          if (innerScene.activeCamera && innerScene.activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            const activeCamera = innerScene.activeCamera as BABYLON.ArcRotateCamera;
            const canvas = innerScene.getEngine().getRenderingCanvas();

            activeCamera.orthoTop! -= event.wheelDelta / 5000;
            activeCamera.orthoBottom! += event.wheelDelta / 5000;
            activeCamera.orthoLeft! += (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
            activeCamera.orthoRight! -= (event.wheelDelta / 5000) * (canvas!.width / canvas!.height);
          }
        } else if (type === BABYLON.PointerEventTypes.POINTERDOWN) {
          const event = pointerInfo.event as PointerEvent;
          // camera rotate 시 perspective 모드로 전환
          if (event.button === 0 && event.altKey && innerScene.activeCamera && innerScene.activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
            innerScene.activeCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;

            if (prevCameraPositions[renderingCanvas1.current!.id]) {
              innerScene.activeCamera.position = prevCameraPositions[renderingCanvas1.current!.id] as BABYLON.Vector3;
              prevCameraPositions[renderingCanvas1.current!.id] = null;
            }

            const grounds = innerScene.getMeshesByTags('ground');
            grounds.forEach((ground) => {
              if (ground.id === 'top') {
                ground.isVisible = true;
              } else {
                ground.isVisible = false;
              }
            });
          }
        }
      });

      // render loop
      engine.runRenderLoop(() => {
        innerScene.render();
      });

      // RP DOM은 반드시 존재하여 TS DAA 적용
      const targetNode = document.getElementById('RP')!;
      const config = { attributes: true };

      const handleEngineResize = () => {
        engine.resize();
      };

      const resizeMutationObserver = new MutationObserver(handleEngineResize);

      resizeMutationObserver.observe(targetNode, config);

      return () => {
        // engine을 없앱니다.
        engine.dispose();
        dispatch(plaskProjectActions.removeScreen({ screenId: innerScene.uid }));

        resizeMutationObserver.disconnect();
      };
    }
  }, [dispatch, prevCameraPositions]);

  /**
   * dragBox 사용
   */
  const rpDragBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const targetScreen = _screenList.find((screen) => screen.canvasId === renderingCanvas1.current?.id);

    if (targetScreen) {
      const { scene } = targetScreen;
      let startPointerPosition: Nullable<ScreenXY> = null;

      const dragBox = rpDragBox.current as HTMLDivElement;
      const dragBoxDefaultStyle = 'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
      dragBox.setAttribute('style', dragBoxDefaultStyle);

      const dragBoxObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
        // pointer down event catched
        switch (pointerInfo.type) {
          case BABYLON.PointerEventTypes.POINTERDOWN: {
            if (
              pointerInfo?.event.button === 0 && // check if it it left click
              !pointerInfo.event.altKey && // camera rotate 시에는 발생하지 않음
              !pointerInfo.pickInfo!.hit // pickInfo always exist with pointer event
            ) {
              // set start point of the dragBox
              startPointerPosition = {
                x: scene.pointerX,
                y: scene.pointerY,
              };
            }
            break;
          }
          case BABYLON.PointerEventTypes.POINTERMOVE: {
            if (startPointerPosition) {
              const currentPointerPosition: Nullable<ScreenXY> = {
                x: scene.pointerX,
                y: scene.pointerY,
              };

              const minX = Math.min(startPointerPosition.x, currentPointerPosition.x);
              const minY = Math.min(startPointerPosition.y, currentPointerPosition.y);
              const maxX = Math.max(startPointerPosition.x, currentPointerPosition.x);
              const maxY = Math.max(startPointerPosition.y, currentPointerPosition.y);

              dragBox.setAttribute('style', `${dragBoxDefaultStyle} left: ${minX}px; top: ${minY}px; width: ${maxX - minX}px; height: ${maxY - minY}px;`);
            }
            break;
          }
          case BABYLON.PointerEventTypes.POINTERUP: {
            if (startPointerPosition) {
              const endPointerPosition: Nullable<ScreenXY> = {
                x: scene.pointerX,
                y: scene.pointerY,
              };

              const newSelectedTargets = _selectableObjects.filter((object) => checkIsObjectIn(startPointerPosition as ScreenXY, endPointerPosition, object, scene));

              if (pointerInfo.event.ctrlKey || pointerInfo.event.metaKey) {
                // ctrl 혹은 meta 키를 누른 채
                dispatch(selectingDataActions.ctrlKeyMultiSelect({ targets: newSelectedTargets }));
              } else {
                // 키 누르지 않고
                dispatch(selectingDataActions.defaultMultiSelect({ targets: newSelectedTargets }));
              }

              // initialize style and start point
              startPointerPosition = null;
              dragBox.setAttribute('style', dragBoxDefaultStyle);
            }
            break;
          }
          default: {
            break;
          }
        }
      });
      return () => {
        scene.onPointerObservable.remove(dragBoxObserver);
      };
    }
  }, [_screenList, _selectableObjects, dispatch]);

  /**
   * contextMenu 사용
   */
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  useEffect(() => {
    const targetScreen = _screenList.find((screen) => screen.canvasId === renderingCanvas1.current?.id); // 단일 캔버스 상황

    if (targetScreen) {
      const { scene } = targetScreen;

      const contextMenuObserver = scene.onPointerObservable.add((pointerInfo, eventState) => {
        // camera panning 시에는 발생하지 않도록하기 위함
        if (pointerInfo.event.button === 2 && !pointerInfo.event.altKey) {
          switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN: {
              setIsContextMenuOpen((prev) => !prev); // 임시로 토글로 넣어놓았읍니다
              console.log('pointer x, y: ', scene.pointerX, scene.pointerY); // 컨텍스트 생성 위치에 사용하면 됩니다
              break;
            }
          }
        }
      });

      return () => {
        scene.onPointerObservable.remove(contextMenuObserver);
      };
    }
  }, [_screenList]);
  useEffect(() => {
    console.log('isContextMenuOpen: ', isContextMenuOpen);
  }, [isContextMenuOpen]);

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
        if (ground.id === view) {
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

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, distance + 10, target.z));
              break;
            case 'b':
            case 'B':
            case 'ㅠ': // b (bottom)
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'bottom');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
              }

              distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, position.y, 0), new BABYLON.Vector3(0, target.y, 0));
              activeCamera.setPosition(new BABYLON.Vector3(target.x, -(distance + 10), target.z));
              break;
            case 'l':
            case 'L':
            case 'ㅣ': // l (left)
              switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'left');

              if (!prevCameraPositions[focusedCanvas.id]) {
                prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
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

                if (!prevCameraPositions[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
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

                if (!prevCameraPositions[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
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
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                switchToOrthoGraphic(focusedCanvas, activeCamera, focusedScene, 'back');

                if (!prevCameraPositions[focusedCanvas.id]) {
                  prevCameraPositions[focusedCanvas.id] = activeCamera.position.clone();
                }

                distance = BABYLON.Vector3.Distance(new BABYLON.Vector3(0, 0, position.z), new BABYLON.Vector3(0, 0, target.z));
                activeCamera.setPosition(new BABYLON.Vector3(target.x, target.y, -(distance + 10)));
              }
              break;
            case 'p':
            case 'P':
            case 'ㅔ': // p (perspective)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if (
                (multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) &&
                multiKeyController[event.key].pressed &&
                activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA
              ) {
                const prevCameraPosition = prevCameraPositions[focusedCanvas.id];
                if (prevCameraPosition) {
                  activeCamera.mode = BABYLON.Camera.PERSPECTIVE_CAMERA;
                  activeCamera.setPosition(prevCameraPosition);
                }

                const grounds = focusedScene.getMeshesByTags('ground');
                grounds.forEach((ground) => {
                  if (ground.id === 'top') {
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
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                if (activeCamera.mode === BABYLON.Camera.ORTHOGRAPHIC_CAMERA) {
                  const focusedCanvas: HTMLCanvasElement | null = document.querySelector('canvas:focus');
                  activeCamera.orthoTop = 2;
                  activeCamera.orthoBottom = -2;
                  activeCamera.orthoLeft = -2 * (focusedCanvas!.width / focusedCanvas!.height);
                  activeCamera.orthoRight = 2 * (focusedCanvas!.width / focusedCanvas!.height);
                } else if (activeCamera.mode === BABYLON.Camera.PERSPECTIVE_CAMERA) {
                  activeCamera.setPosition(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_POSITION_ARRAY));
                  activeCamera.setTarget(BABYLON.Vector3.FromArray(DEFAULT_CAMERA_TARGET_ARRAY));
                }
              }
              break;
            case 'a':
            case 'A':
            case 'ㅁ':
              if (event.ctrlKey || event.metaKey) {
                dispatch(selectingDataActions.selectAllSelectableObjects());
              }
              break;
            case 'd':
            case 'D':
            case 'ㅇ':
              if (event.ctrlKey || event.metaKey) {
                dispatch(selectingDataActions.resetSelectedTargets());
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
        case 'p':
        case 'P':
        case 'ㅔ':
        case 'h':
        case 'H':
        case 'ㅗ':
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
  }, [_screenList, dispatch, multiKeyController, prevCameraPositions]);

  /******************************************************************************
   * 기존 useGizmoControl의 내용
   *****************************************************************************/
  const [gizmoManager, setGizmoManager] = useState<BABYLON.GizmoManager>();
  const [currentGizmoMode, setCurrentGizmoMode] = useState<GizmoMode>('position');

  /**
   * gizmoManager 생성
   */
  useEffect(() => {
    const baseScreen = _screenList[0];
    if (baseScreen && baseScreen.scene) {
      const innerGizmoManager = new BABYLON.GizmoManager(baseScreen.scene);

      setGizmoManager(innerGizmoManager);
      innerGizmoManager.usePointerToAttachGizmos = false;
      innerGizmoManager.positionGizmoEnabled = true; // position을 기본 모드로 설정
    }
  }, [_screenList]);

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
    // 선택효과 적용
    _selectedTargets.forEach((target) => {
      if (checkIsTargetMesh(target)) {
        // 컨트롤러
        target.renderOutline = true;
        target.outlineColor = BABYLON.Color3.White();
        target.outlineWidth = 0.1;
      } else {
        // joint(transformNode)
        const joint = target.getScene().getMeshById(target.id.replace('transformNode', 'joint'));
        if (joint) {
          joint.renderOutline = true;
          joint.outlineColor = BABYLON.Color3.White();
          joint.outlineWidth = 0.3;
        }
      }
    });

    if (gizmoManager) {
      if (_selectedTargets.length === 0) {
        // 선택 해제 시
        gizmoManager.attachToNode(null);
      } else if (_selectedTargets.length === 1) {
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
        if (!checkIsTargetMesh(_selectedTargets[0])) {
          // transformNode 단일 선택 시
          gizmoManager.attachToNode(_selectedTargets[0]);

          return () => {
            // 선택효과 해제
            const target = _selectedTargets[0];
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
        } else if (_selectedTargets[0].getClassName() === 'Mesh') {
          // controller 단일 선택 시
          gizmoManager.attachToMesh(_selectedTargets[0] as BABYLON.Mesh);

          const linkedTransformNode = _selectedTargets[0].getScene().getTransformNodeById(_selectedTargets[0].id.replace('controller', 'transformNode'));

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
                const target = _selectedTargets[0];
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
                const target = _selectedTargets[0];
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
                const target = _selectedTargets[0];
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

        const selectedTransformNodes = _selectedTargets.filter((target) => !checkIsTargetMesh(target)) as BABYLON.TransformNode[];
        const selectedControllers = _selectedTargets.filter((target) => checkIsTargetMesh(target)) as BABYLON.Mesh[];

        return () => {
          // 선택효과 해제
          _selectedTargets.forEach((target) => {
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
  }, [_selectedTargets, currentGizmoMode, gizmoManager]);

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

    if (visualizedAnimationIngredients.length > 0) {
      _screenList.forEach(({ scene }) => {
        scene.animationGroups.forEach((animationGroup) => {
          scene.removeAnimationGroup(animationGroup);
        });
      });

      const newAnimationGroup = new BABYLON.AnimationGroup(visualizedAnimationIngredients.length === 1 ? visualizedAnimationIngredients[0].name : 'totalAnimationGroup');

      visualizedAnimationIngredients.forEach((animationIngredient) => {
        // layer 고려가 들어가야 함
        // 각 layer의 transformKeys 합해주는 연산 필요
        const { id, name, assetId, tracks, layers } = animationIngredient;

        const transformKeysListForTargetId: {
          [id in string]: {
            target: BABYLON.Mesh | BABYLON.TransformNode;
            positionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
            rotationQuaternionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
            scalingTransformKeysList: Array<BABYLON.IAnimationKey[]>;
          };
        } = {};

        tracks.forEach((track) => {
          // 비어있는 트랙은 애니메이션 그룹 생성 시 사용하지 않음
          if (track.transformKeys.length > 0) {
            if (track.property !== 'rotation') {
              // rotation track은 단순히 TP내 렌더링 역할만을 하며, 애니메이션 생성 시에는 rotationQuaternion track을 사용
              if (track.isIncluded) {
                if (track.property === 'position') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].positionTransformKeysList.push(
                      track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                      rotationQuaternionTransformKeysList: [],
                      scalingTransformKeysList: [],
                    };
                  }
                } else if (track.property === 'rotationQuaternion') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].rotationQuaternionTransformKeysList.push(
                      track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [],
                      rotationQuaternionTransformKeysList: [track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                      scalingTransformKeysList: [],
                    };
                  }
                } else if (track.property === 'scaling') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].scalingTransformKeysList.push(
                      track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [],
                      rotationQuaternionTransformKeysList: [],
                      scalingTransformKeysList: [track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                    };
                  }
                }
              }
            }
          }
        });

        Object.entries(transformKeysListForTargetId).forEach(([targetId, { target, positionTransformKeysList, rotationQuaternionTransformKeysList, scalingTransformKeysList }]) => {
          const positionTotalTransformKeys = getTotalTransformKeys(positionTransformKeysList, false);
          const rotationQuaternionTotalTransformKeys = getTotalTransformKeys(rotationQuaternionTransformKeysList, true);
          const scalingTotalTransformKeys = getTotalTransformKeys(scalingTransformKeysList, false);

          const newPositionAnimation = new BABYLON.Animation(
            `${target.name}|position`,
            'position',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newPositionAnimation.setKeys(positionTotalTransformKeys);

          const newRotationQuaternionAnimation = new BABYLON.Animation(
            `${target.name}|rotationQuaternion`,
            'rotationQuaternion',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newRotationQuaternionAnimation.setKeys(rotationQuaternionTotalTransformKeys);

          const newScalingAnimation = new BABYLON.Animation(
            `${target.name}|scaling`,
            'scaling',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newScalingAnimation.setKeys(scalingTotalTransformKeys);

          newAnimationGroup.addTargetedAnimation(newPositionAnimation, target);
          newAnimationGroup.addTargetedAnimation(newRotationQuaternionAnimation, target);
          newAnimationGroup.addTargetedAnimation(newScalingAnimation, target);
        });
      });

      newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);
      dispatch(animatingControlsActions.setCurrentAnimationGroup({ animationGroup: newAnimationGroup }));
    }
  }, [_animationIngredients, _endTimeIndex, _fps, _screenList, _startTimeIndex, _visualizedAssetIds, dispatch]);

  return (
    <div className={cx('wrapper')}>
      <div id="rpDragBox" ref={rpDragBox}></div>
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
    </div>
  );
};

export default RenderingPanel;
