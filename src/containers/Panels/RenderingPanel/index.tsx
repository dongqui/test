import { FunctionComponent, useRef, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useContextMenu } from 'new_components/ContextMenu/ContextMenu';
import * as animationDataActions from 'actions/animationDataAction';
import * as plaskProjectActions from 'actions/plaskProjectAction';
import * as screenDataActions from 'actions/screenDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as trackListActions from 'actions/trackList';
import * as keyframeActions from 'actions/keyframes';
import { useSelector } from 'reducers';
import { ArrayOfThreeNumbers, GizmoMode, GizmoSpace, PlaskProperty } from 'types/common';
import { ScreenVisivilityItem } from 'types/RP';
import plaskEngine from '3d/PlaskEngine';
import ScreenVisibility from './ScreenVisibility';
import '@babylonjs/inspector';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useObserved } from 'hooks/common/useObserved';
import SelectorModule from '3d/modules/selector/SelectorModule';
import { PlaskTransformNode, PlaskTransformNodeType } from '3d/entities/PlaskTransformNode';
import { selectionChanged } from './stateSync';
import { setCurrentAnimationGroup } from 'actions/animatingControlsAction';
import { Controller } from 'react-hook-form';
import usePlaskShortcut from 'hooks/common/usePlaskShortcut';
import { ShortcutOption } from 'hooks/common/usePlaskShortcut';

const cx = classNames.bind(styles);

interface Props {}

const RenderingPanel: FunctionComponent<React.PropsWithChildren<Props>> = () => {
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
  const _currentAnimationGroup = useSelector((state) => state.animatingControls.currentAnimationGroup);
  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _visibilityOptions = useSelector((state) => state.screenData.visibilityOptions);

  const dispatch = useDispatch();

  const { onContextMenuOpen, onContextMenuClose } = useContextMenu();

  const renderingCanvas1 = useRef<HTMLCanvasElement>(null);

  /****************************************************************************
   * Initiate Babylon stuff.
   * Create engine, scene.
   * Add default settings including a camera, grounds and etc.
   *****************************************************************************/

  /**
   * create scene and add default settings
   */

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
  }, [dispatch]);

  /**************************
   * STATE BIND
   * ONE WAY FLOW FROM REACT TO BABYLONJS
   * OBSERVABLES TO UPDATE REDUX STATE
   *
   *************************/
  // Selection
  useObserved(SelectorModule._onUserSelectRequest, selectionChanged);

  // Animation data
  // useEffect(() => {
  //   if (_currentAnimationGroup) {
  //     plaskEngine.ikModule.setIKtoFK(plaskEngine.ikModule.ikControllers);
  //   }
  // }, [_currentAnimationGroup, dispatch]);

  useEffect(() => {
    const animationGroup = plaskEngine.animationModule.regenerateAnimations(_animationIngredients, _visualizedAssetIds, _startTimeIndex, _endTimeIndex);
    if (animationGroup) {
      dispatch(setCurrentAnimationGroup({ animationGroup }));
    }
  }, [_animationIngredients, _startTimeIndex, _endTimeIndex, _visualizedAssetIds, dispatch]);

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
  }, [_screenList, dispatch]);

  const RPShortcutOptions: ShortcutOption = {
    repeatOnHold: false,
    focus: {
      target: renderingCanvas1.current,
    },
  };

  /**
   * shortcuts related to camera navigation, viewport changes
   */
  usePlaskShortcut(
    ['v', 'f'],
    () => {
      plaskEngine.cameraModule.toOrthographic('front');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['v', 't'],
    () => {
      plaskEngine.cameraModule.toOrthographic('top');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['v', 'l'],
    () => {
      plaskEngine.cameraModule.toOrthographic('left');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['v', 'k'],
    () => {
      plaskEngine.cameraModule.toOrthographic('back');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['v', 'r'],
    () => {
      plaskEngine.cameraModule.toOrthographic('right');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['v', 'b'],
    () => {
      plaskEngine.cameraModule.toOrthographic('bottom');
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['p'],
    () => {
      plaskEngine.cameraModule.toPerspective();
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['h'],
    () => {
      plaskEngine.cameraModule.resetView();
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['control', 'a'],
    () => {
      dispatch(selectingDataActions.selectAllSelectableObjects());
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['control', 'p'],
    (_key: any, event: any) => {
      plaskEngine.toggleInspector();
      event.preventDefault();
    },
    RPShortcutOptions,
  );

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

  usePlaskShortcut(
    ['w'],
    () => {
      const selectedTarget = _selectedTargets[0];
      if (selectedTarget?.transformable.position) {
        plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
      }
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['e'],
    () => {
      const selectedTarget = _selectedTargets[0];
      if (selectedTarget?.transformable.rotation.euler && selectedTarget.transformable.rotation.quaternion) {
        plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.ROTATION);
      }
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['r'],
    () => {
      const selectedTarget = _selectedTargets[0];
      if (selectedTarget?.transformable.scale) {
        plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.SCALE);
      }
    },
    RPShortcutOptions,
  );
  usePlaskShortcut(
    ['escape'],
    () => {
      dispatch(selectingDataActions.resetSelectedTargets());
    },
    RPShortcutOptions,
  );
  /**
   * shortcuts related to the gizmoManager
   */

  usePlaskShortcut(
    ['`'],
    () => {
      const selectedTarget = _selectedTargets[0];
      plaskEngine.gizmoModule.changeGizmoSpace(plaskEngine.gizmoModule.currentGizmoSpace === GizmoSpace.LOCAL ? GizmoSpace.WORLD : GizmoSpace.LOCAL);
    },
    RPShortcutOptions,
  );
  /******************************************************************************
   * Related to RP's sub-containers
   * Including contextMenu and dropDown
   *****************************************************************************/

  /**
   * contextMenu
   */
  // TODO Block
  const transformChildren = useMemo(
    () => [
      {
        label: 'Position',
        // disabled: plaskEngine.gizmoModule.currentGizmoMode === GizmoMode.POSITION || !_selectedTargets[0]?.transformable.position,
        disabled: !_selectedTargets[0]?.transformable.position,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
        },
      },
      {
        label: 'Rotation',
        disabled: !_selectedTargets[0]?.transformable.rotation.euler || !_selectedTargets[0]?.transformable.rotation.quaternion,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.ROTATION);
        },
      },
      {
        label: 'Scale',
        disabled: !_selectedTargets[0]?.transformable.scale,
        onClick: () => {
          plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.SCALE);
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plaskEngine.gizmoModule.currentGizmoMode, _selectedTargets[0]],
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
            dispatch(keyframeActions.editKeyframesSocket.request());
          }
        },
      },
    ],
    [_playState, _selectedTargets.length, dispatch, orientChildren, transformChildren],
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
  }, [_screenList, _visualizedAssetIds, dispatch]);

  useEffect(() => {
    const selectedTarget = _selectedTargets[0];
    if (selectedTarget) {
      if (selectedTarget?.type === 'ik_controller') {
        plaskEngine.gizmoModule.changeGizmoMode(GizmoMode.POSITION);
      }
    }
  }, [_selectedTargets]);

  const screenVisibilityItemList: ScreenVisivilityItem[] = useMemo(() => {
    const targetScreen = _screenList[0];
    if (targetScreen) {
      const targetVisibilityOption = _visibilityOptions.find((visibilityOption) => visibilityOption.screenId === targetScreen.id);

      return [
        {
          value: 'Bone',
          onSelect: () => {
            dispatch(screenDataActions.setBoneVisibility({ screenId: targetScreen.id, value: !targetVisibilityOption!.isBoneVisible }));
            plaskEngine.visibilityLayers.updateVisibility('Bone');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isBoneVisible : true,
          active: !(targetVisibilityOption && !targetVisibilityOption.isMeshVisible),
        },
        {
          value: 'Mesh',
          onSelect: () => {
            dispatch(screenDataActions.setMeshVisibility({ screenId: targetScreen.id, value: !targetVisibilityOption!.isMeshVisible }));
            plaskEngine.visibilityLayers.updateVisibility('Mesh');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isMeshVisible : true,
          active: !(targetVisibilityOption && !targetVisibilityOption.isBoneVisible),
        },
        {
          value: 'Gizmo',
          onSelect: () => {
            dispatch(screenDataActions.setGizmoVisibility({ screenId: targetScreen.id, value: !targetVisibilityOption!.isGizmoVisible }));
            plaskEngine.visibilityLayers.updateVisibility('Gizmo');
          },
          checked: targetVisibilityOption ? targetVisibilityOption.isGizmoVisible : true,
          active: true,
        },
        // {
        //   value: 'IK Controllers',
        //   onSelect: () => {
        //     plaskEngine.visibilityLayers.toggleVisibility('IK Controllers');
        //   },
        //   checked: targetVisibilityOption ? targetVisibilityOption.isIKControllerVisible : true,
        //   active: !(targetVisibilityOption && !targetVisibilityOption.isMeshVisible),
        // },
      ];
    } else {
      return [];
    }
  }, [dispatch, _visibilityOptions, _screenList]);

  return (
    <div className={cx('wrapper')}>
      <div id="rpDragBox" ref={rpDragBox} />
      <canvas className={cx('rendering-canvas')} ref={renderingCanvas1} id="renderingCanvas1" />
      <ScreenVisibility itemList={screenVisibilityItemList} />
    </div>
  );
};

export default RenderingPanel;
