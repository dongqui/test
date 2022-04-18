import { FunctionComponent, useRef, useEffect, useMemo, useState, useCallback, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as animationDataActions from 'actions/animationDataAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as screenDataActions from 'actions/screenDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as trackListActions from 'actions/trackList';
import { useSelector } from 'reducers';
import { GizmoMode, GizmoSpace, PlaskView } from 'types/common';
import { ScreenVisivilityItem } from 'types/RP';
import { BabylonContext } from 'contexts/RP/BabylonContext';
import ScreenVisibility from './ScreenVisibility';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<Props> = () => {
  /**
   * global states
   */
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _fps = useSelector((state) => state.plaskProject.fps);
  const _selectableObjects = useSelector((state) => state.selectingData.present.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.present.selectedTargets);
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
   * create scene and add default settings
   */
  const { plaskEngine } = useContext(BabylonContext);

  useEffect(() => {
    if (renderingCanvas1.current) {
      // Initialize Plask engine
      // ? Can we have several canvas/engine ? -> @kenny not now, but multi-canvas environmnet will be handled later
      plaskEngine.initialize(renderingCanvas1.current, dispatch);

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

  const prevCameraPositions = plaskEngine.cameraModule.prevPositions;
  const prevCameraTargets = plaskEngine.cameraModule.prevTargets;

  /**
   * dragBox interacting with scene
   */
  const rpDragBox = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dragBox = rpDragBox.current as HTMLDivElement;
    const dragBoxDefaultStyle = 'background-color: gray; position: absolute; opacity: 0.3; pointer-events: none;';
    dragBox.setAttribute('style', dragBoxDefaultStyle);

    // DragBox end
    const endSelectBoxObserver = plaskEngine.selectorModule.onEndSelectBox.add(({ type, objects }) => {
      dragBox.setAttribute('style', dragBoxDefaultStyle);
    });

    // DragBox updated
    const selectBoxUpdatedObserver = plaskEngine.selectorModule.onSelectBoxUpdated.add(({ min, max }) => {
      dragBox.setAttribute('style', `${dragBoxDefaultStyle} left: ${min.x}px; top: ${min.y}px; width: ${max.x - min.x}px; height: ${max.y - min.y}px;`);
    });

    return () => {
      plaskEngine.selectorModule.onEndSelectBox.remove(endSelectBoxObserver);
      plaskEngine.selectorModule.onSelectBoxUpdated.remove(selectBoxUpdatedObserver);
    };
  }, [_screenList, dispatch, plaskEngine]);

  /**
   * shortcuts related to camera navigation, viewport changes
   */
  useEffect(() => {
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

        if (focusedScene) {
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
              plaskEngine.cameraModule.toOrthographic('top');
              break;
            case 'b':
            case 'B':
            case 'ㅠ': // b (bottom)
              plaskEngine.cameraModule.toOrthographic('bottom');
              break;
            case 'l':
            case 'L':
            case 'ㅣ': // l (left)
              plaskEngine.cameraModule.toOrthographic('left');
              break;
            case 'r':
            case 'R':
            case 'ㄱ': // r (right)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                plaskEngine.cameraModule.toOrthographic('right');
              }

              break;
            case 'f':
            case 'F':
            case 'ㄹ': // f (front)
              if (multiKeyController[event.key]) {
                multiKeyController[event.key].pressed = true;
              }
              if ((multiKeyController.v.pressed || multiKeyController.V.pressed || multiKeyController.ㅍ.pressed) && multiKeyController[event.key].pressed) {
                plaskEngine.cameraModule.toOrthographic('front');
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
                  plaskEngine.cameraModule.toOrthographic('back');
                }
              }
              break;
            case 'p':
            case 'P':
            case 'ㅔ': // p (perspective)
              plaskEngine.cameraModule.toPerspective();
              break;
            case 'h':
            case 'H':
            case 'ㅗ': // h (camera reset)
              plaskEngine.cameraModule.resetView();
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

      // Keyboard events that don't require a canvas focus
      switch (event.key) {
        case 'z':
        case 'Z':
        case 'ㅋ': {
          if (event.ctrlKey || event.metaKey) {
            if (event.shiftKey) {
              plaskEngine.redo();
            } else {
              plaskEngine.undo();
            }
          }
          event.preventDefault();
          break;
        }
        default:
          break;
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
  }, [_screenList, dispatch, multiKeyController, plaskEngine]);

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
   * shortcuts related to the gizmoManager
   */
  useEffect(() => {
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
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
          break;
        }
        case 'e':
        case 'E':
        case 'ㄷ': {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.ROTATION);
          break;
        }
        case 'r':
        case 'R':
        case 'ㄱ': {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.SCALE);
          break;
        }
        case 'Escape': {
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
  }, [dispatch, plaskEngine.gizmoModule]);

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
          plaskEngine.gizmoModule.changeGizmoSpace(plaskEngine.gizmoModule.currentGizmoSpace === GizmoSpace.LOCAL ? GizmoSpace.WORLD : GizmoSpace.LOCAL);
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
  }, [plaskEngine.gizmoModule]);

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
        disabled: plaskEngine.gizmoModule.currentGizmoMode === GizmoMode.POSITION,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
        },
      },
      {
        label: 'Rotation',
        disabled: plaskEngine.gizmoModule.currentGizmoMode === GizmoMode.ROTATION,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.ROTATION);
        },
      },
      {
        label: 'Scale',
        disabled: plaskEngine.gizmoModule.currentGizmoMode === GizmoMode.SCALE,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.SCALE);
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plaskEngine.gizmoModule.currentGizmoMode],
  );

  const orientChildren = useMemo(
    () => [
      {
        label: 'World',
        disabled: plaskEngine.gizmoModule.currentGizmoSpace === GizmoSpace.WORLD,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoSpace(GizmoSpace.WORLD);
        },
      },
      {
        label: 'Local',
        disabled: plaskEngine.gizmoModule.currentGizmoSpace === GizmoSpace.LOCAL,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoSpace(GizmoSpace.LOCAL);
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plaskEngine.gizmoModule.currentGizmoSpace],
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
          plaskEngine.cameraModule.resetView();
        },
      },
      {
        label: 'View',
        separator: true,
        children: [
          {
            label: 'Perspective',
            onClick: () => {
              plaskEngine.cameraModule.toPerspective();
            },
          },
          {
            label: 'Front',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('front');
            },
          },
          {
            label: 'Back',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('back');
            },
          },
          {
            label: 'Top',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('top');
            },
          },
          {
            label: 'Bottom',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('bottom');
            },
          },
          {
            label: 'Right',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('right');
            },
          },
          {
            label: 'Left',
            onClick: () => {
              plaskEngine.cameraModule.toOrthographic('left');
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
    [_playState, _selectedTargets.length, dispatch, orientChildren, transformChildren, plaskEngine],
  );

  useEffect(() => {
    const observer = plaskEngine.onContextMenuOpenObservable.add((position) => {
      onContextMenuClose();
      onContextMenuOpen({ top: position.y, left: position.x, menu: contextMenuList });
    });

    return () => {
      plaskEngine.onContextMenuOpenObservable.remove(observer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plaskEngine, contextMenuList]);

  /**
   * screenVisibilityMenu
   */
  // use skeletonViewer only for debugging purpose
  useEffect(() => {
    const targetScreen = _screenList[0];
    if (targetScreen) {
      // TODO : babylon non-persistent entity, shouldn't be in the state (kept for now for compatibility)
      dispatch(screenDataActions.addSkeletonViewer({ screenId: targetScreen.id, skeletonViewer: plaskEngine.visibilityLayers.skeletonViewer! }));

      return () => {
        dispatch(screenDataActions.removeSkeletonViewer({ screenId: targetScreen.id }));
      };
    }
  }, [_screenList, _visualizedAssetIds, dispatch, plaskEngine]);

  const screenVisibilityItemList: ScreenVisivilityItem[] = useMemo(() => {
    const targetScreen = _screenList[0];
    if (targetScreen) {
      const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === targetScreen.id);

      return [
        {
          value: 'Bone',
          onSelect: () => {
            plaskEngine.visibilityLayers.toggleVisibility('Bone');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true,
          active: !(targetVisibilityOption && !targetVisibilityOption.isMeshVisible),
        },
        {
          value: 'Mesh',
          onSelect: () => {
            plaskEngine.visibilityLayers.toggleVisibility('Mesh');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isMeshVisible : true,
          active: !(targetVisibilityOption && !targetVisibilityOption.isBoneVisible),
        },
        {
          value: 'Gizmo',
          onSelect: () => {
            plaskEngine.visibilityLayers.toggleVisibility('Gizmo');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isGizmoVisible : true,
          active: true,
        },
      ];
    } else {
      return [];
    }
  }, [_visibilityOptions, _screenList, plaskEngine]);

  return (
    <div className={cx('wrapper')}>
      <div id="rpDragBox" ref={rpDragBox} />
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
      <ScreenVisibility itemList={screenVisibilityItemList} />
    </div>
  );
};

export default RenderingPanel;
