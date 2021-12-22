import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { isNull, isUndefined } from 'lodash';
import { useDispatch } from 'react-redux';
import AnimationInputWrapper from './AnimationInputWrapper';
import AnimationFKWrapper from './AnimationFKWrapper';
import * as animationDataActions from 'actions/animationDataAction';
import * as selectingDataActions from 'actions/selectingDataAction';
import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { useBaseModal } from 'new_components/Modal/BaseModal';
import { AnimationIngredient, Nullable, PlaskPaletteColor, PlaskPaletteColorName, PlaskRotationType, PlaskTrack } from 'types/common';
import { useSelector } from 'reducers';
import { forceClickAnimationPauseAndPlay, forceClickAnimationPlayAndStop } from 'utils/common';
import { checkIsTargetMesh } from 'utils/RP';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PALETTE_COLORS: { [color in PlaskPaletteColorName]: string } = {
  red: '#FF6969',
  orange: '#FC9B51',
  yellow: '#FFDB56',
  green: '#4FD675',
  blue: '#61E4ED',
  purple: '#D687F4',
  pink: '#FF8CC9',
};
const DEFAULT_CONTROLLER_COLOR = 'yellow';

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _seletedLayer = useSelector((state) => state.trackList.selectedLayer); // selectedLayerId에 해당
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);

  const dispatch = useDispatch();

  const { onModalOpen, onModalClose, getConfirm } = useBaseModal();

  // 다중모델 설계 내에서 단일모델 상황을 가정하기 위함 (추후 다중모델 설계 자체를 단일모델 설계로 변경할 계획)
  const selectedAssetId = useMemo(() => _visualizedAssetIds[0], [_visualizedAssetIds]);

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlController, setControlController] = useState<Nullable<BABYLON.Mesh>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

  // position value를 관리하는 useState
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [positionZ, setPositionZ] = useState<number>(0);

  // euler value를 관리하는 useState
  const [eulerX, setEulerX] = useState<number>(0);
  const [eulerY, setEulerY] = useState<number>(0);
  const [eulerZ, setEulerZ] = useState<number>(0);

  // quarternion value를 관리하는 useState
  const [quarternionW, setQuarternionW] = useState<number>(1);
  const [quarternionX, setQuarternionX] = useState<number>(0);
  const [quarternionY, setQuarternionY] = useState<number>(0);
  const [quarternionZ, setQuarternionZ] = useState<number>(0);

  // sclae value를 관리하는 useState
  const [scaleX, setScaleX] = useState<number>(0);
  const [scaleY, setScaleY] = useState<number>(0);
  const [scaleZ, setScaleZ] = useState<number>(0);

  // FK Controller value를 관리하는 useState
  const [controllerX, setControllerX] = useState<number>(0);
  const [controllerZ, setControllerZ] = useState<number>(0);
  const [controllerColor, setControllerColor] = useState<PlaskPaletteColor>(PALETTE_COLORS[DEFAULT_CONTROLLER_COLOR] as PlaskPaletteColor);

  // section spread status
  const [isTransformSectionSpread, setIsTransformSectionSpread] = useState<boolean>(true);
  const [isControllerSectionSpread, setIsControllerSectionSpread] = useState<boolean>(true);
  const [isFilterSectionSpread, setIsFilterSectionSpread] = useState<boolean>(true);
  // const [isVisibilitySectionSpread, setIsVisibilitySectionSpread] = useState<boolean>(true);

  // transform section
  const [currentRotationType, setCurrentRotationType] = useState<PlaskRotationType>('euler');

  // controller section
  const [isControllerOn, setIsControllerOn] = useState<boolean>(false);

  // filter section
  const [isFilterOn, setIsFilterOn] = useState<boolean>(false);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);

  // transform section을 위한 control target 선택
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // 선택되지 않은 경우
      setControlTarget(null);
    } else if (_selectedTargets.length === 1) {
      // 단일대상 선택된 경우
      setControlTarget(_selectedTargets[0]);
    } else {
      // 다중대상 선택된 경우
      setControlTarget(null);
    }
  }, [_selectableObjects, _selectedTargets]);

  // controller section을 위한 control controller 선택
  // 선택 대상이 transformNode인 경우 연결된 controller를 선택
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // 선택되지 않은 경우
      setControlController(null);
    } else if (_selectedTargets.length === 1) {
      // 단일대상 선택된 경우, 대상이 컨트롤러거나 연결된 컨트롤러가 있다면 control controller로 선택
      if (checkIsTargetMesh(_selectedTargets[0])) {
        setControlController(_selectedTargets[0]);
      } else {
        const connectedController = _selectableObjects.find((object) => object.id === _selectedTargets[0].id.replace('transformNode', 'controller'));
        if (connectedController) {
          setControlController(connectedController as BABYLON.Mesh);
        } else {
          setControlController(null);
        }
      }
    } else {
      // 다중대상 선택된 경우
      setControlController(null);
    }
  }, [_selectableObjects, _selectedTargets]);

  // filter section을 위한 control track 선택
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      setControlTrack(null);
    } else if (_selectedTargets.length === 1) {
      const targetAssetId = _selectedTargets[0].id.split('//')[0];
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === targetAssetId);
      const targetTrack = targetAnimationIngredient?.tracks.find((track) => track.targetId === _selectedTargets[0].id && track.layerId === _seletedLayer);
      if (targetTrack) {
        setControlTrack(targetTrack);
      }
    } else {
      setControlTrack(null);
    }
  }, [_animationIngredients, _selectedTargets, _seletedLayer]);

  // transform section 변경
  useEffect(() => {
    if (controlTarget) {
      const matrixUpdateObservable = controlTarget.onAfterWorldMatrixUpdateObservable.add((target) => {
        const { position, rotationQuaternion, scaling } = target;
        setPositionX(position.x);
        setPositionY(position.y);
        setPositionZ(position.z);

        const e = rotationQuaternion!.clone().toEulerAngles();
        setEulerX(e.x);
        setEulerY(e.y);
        setEulerZ(e.z);

        setQuarternionW(rotationQuaternion!.w);
        setQuarternionX(rotationQuaternion!.x);
        setQuarternionY(rotationQuaternion!.y);
        setQuarternionZ(rotationQuaternion!.z);

        setScaleX(scaling.x);
        setScaleY(scaling.y);
        setScaleZ(scaling.z);
      });

      return () => {
        controlTarget.onAfterWorldMatrixUpdateObservable.remove(matrixUpdateObservable);
      };
    }
  });

  // 선택 대상에 따라 controller toggle 변경
  useEffect(() => {
    if (selectedAssetId) {
      if (_selectableObjects.find((object) => object.id.includes(selectedAssetId) && checkIsTargetMesh(object))) {
        setIsControllerOn(true);
      } else {
        setIsControllerOn(false);
      }
    } else {
      setIsControllerOn(false);
    }
  }, [_selectableObjects, selectedAssetId]);

  // 선택 대상에 따라 controller properties 변경
  useEffect(() => {
    if (controlController) {
      setControllerX(controlController.scaling.x);
      setControllerZ(controlController.scaling.z);
      // @ts-ignore
      setControllerColor(controlController.material.emissiveColor.toHexString() as PlaskPaletteColor);
    }
  }, [controlController]);

  // 선택 대상에 따라 filter toggle 변경
  useEffect(() => {
    if (selectedAssetId) {
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
      if (targetAnimationIngredient) {
        const selectedLayerFirstTrack = targetAnimationIngredient.tracks.find((track) => track.layerId === _seletedLayer);
        setIsFilterOn(selectedLayerFirstTrack ? selectedLayerFirstTrack.useFilter : false);
      } else {
        setIsFilterOn(false);
      }
    } else {
      setIsFilterOn(false);
    }
  }, [_animationIngredients, _seletedLayer, selectedAssetId]);

  // 선택 대상에 따라 filter parameters 변경
  useEffect(() => {
    if (controlTrack && controlTrack.useFilter) {
      setFcValue(controlTrack.filterMinCutoff);
      setBetaValue(controlTrack.filterBeta);
    } else {
      setFcValue(10);
      setBetaValue(1);
    }
  }, [controlTrack]);

  // Transform section을 펼치거나 접을 수 있는 콜백
  const handleSpreadTransform = useCallback(() => {
    if (isTransformSectionSpread) {
      setIsTransformSectionSpread(false);
    } else {
      setIsTransformSectionSpread(true);
    }
  }, [isTransformSectionSpread]);

  // Controller section읅 펼치거나 접을 수 있는 콜백
  const handleSpreadController = useCallback(() => {
    if (isControllerSectionSpread) {
      setIsControllerSectionSpread(false);
    } else {
      setIsControllerSectionSpread(true);
    }
  }, [isControllerSectionSpread]);

  // Filter section읅 펼치거나 접을 수 있는 콜백
  const handleSpreadFilter = useCallback(() => {
    if (isFilterSectionSpread) {
      setIsFilterSectionSpread(false);
    } else {
      setIsFilterSectionSpread(true);
    }
  }, [isFilterSectionSpread]);

  // Controller의 생성 / 삭제
  const handleControllerToggle = useCallback(async () => {
    if (selectedAssetId) {
      if (isControllerOn) {
        setIsControllerOn(false);
        // 삭제
      } else {
        setIsControllerOn(true);
        // 생성
        const targetAsset = _assetList.find((asset) => asset.id === selectedAssetId)!;
        const targetRetargetMap = _retargetMaps.find((retargetMap) => retargetMap.assetId === selectedAssetId);
        const targetTransformNodeIds = targetRetargetMap?.values.map((value) => value.targetTransformNodeId);
        // retargetMap이 없거나 완성되지 않은 경우
        if (!targetTransformNodeIds || targetTransformNodeIds.find((targetTransformNodeId) => isNull(targetTransformNodeId))) {
          const confirmedToMove = await getConfirm({
            title: 'Confirm',
            message: 'Invalid retarget information. Will you finish mapping, first?',
            confirmText: 'Confirm',
            cancelText: 'Cancel',
          });
          if (confirmedToMove) {
            // CP -> retarget tab으로 전환
          }
          return;
        }

        // 애니메이션 옮길지 말지
        const confirmedToCopy = await getConfirm({
          title: 'Confirm',
          message: `Do you want to copy existing keyframes from bones to controllers?`,
          confirmText: 'Confirm',
          cancelText: 'Cancel',
        });

        _screenList.forEach((screen) => {
          const controllers: BABYLON.Mesh[] = [];
          const controllerMaterial = new BABYLON.StandardMaterial('controllerMaterial', screen.scene);
          controllerMaterial.emissiveColor = BABYLON.Color3.FromHexString(PALETTE_COLORS[DEFAULT_CONTROLLER_COLOR]);
          controllerMaterial.disableLighting = true;

          // 컨트롤러 생성
          targetAsset.bones.forEach((bone, idx) => {
            const connectedTransformNode = bone.getTransformNode();
            if (connectedTransformNode && targetTransformNodeIds.includes(connectedTransformNode.id)) {
              const controller = BABYLON.MeshBuilder.CreateTorus(
                `${bone.name}_controller`,
                {
                  diameter: 40,
                  thickness: 0.2,
                  tessellation: 64,
                },
                screen.scene,
              );
              controller.renderingGroupId = 3;
              controller.id = `${targetAsset.id}//${bone.name}//controller`;
              controller.material = controllerMaterial.clone('controllerMaterial');

              if (controllers.length === 0) {
                // controller들의 scale을 모델에 맞추기 위해, Armature bone을 hips controller의 parent로 설정
                controller.setParent(bone.getParent());
              }

              // controller actionManager 생성 및 pick, hover action 등록
              controller.actionManager = new BABYLON.ActionManager(screen.scene);
              controller.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, (event) => {
                  dispatch(selectingDataActions.defaultSingleSelect({ target: controller }));
                }),
              );

              controller.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, (event) => {
                  screen.scene.hoverCursor = 'pointer';
                }),
              );

              controllers.push(controller);
            }
          });

          // 컨트롤러 간 계층구조 생성
          controllers.forEach((controller, idx) => {
            const targetBone = targetAsset.bones.find((bone) => bone.id === controller.id.replace('controller', 'bone'));
            if (targetBone && targetBone.children.length > 0) {
              targetBone.children.forEach((childBone) => {
                const childController = controllers.find((ctrl) => ctrl.id === childBone.id.replace('bone', 'controller'));
                if (childController) {
                  childController.setParent(controller);
                }
              });
            }
            if (targetBone) {
              targetBone.computeWorldMatrix(true);
              controller.scaling = new BABYLON.Vector3(1, 1, 1);
              controller.position = targetBone.position;
            }
          });

          // controller들 또한 dragBox로 선택 가능하도록
          dispatch(selectingDataActions.addSelectableObjects({ objects: controllers }));

          // controller의 애니메이션 추가
          const currentAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === targetAsset.id && animationIngredient.current);
          if (currentAnimationIngredient) {
            const { tracks, layers } = currentAnimationIngredient;

            const newTracks: PlaskTrack[] = [];

            controllers.forEach((controller) => {
              // rotationQuaternion으로 회전법 바꾸는 처리
              controller.rotate(BABYLON.Axis.X, 0);

              // 대응하는 transformNode의 애니메이션을 사용해 controller의 애니메이션 생성 및 animationIngredient에 추가
              layers.forEach((layer) => {
                const transformNodeTracks = tracks.filter((track) => track.targetId === controller.id.replace('controller', 'transformNode') && track.layerId === layer.id);
                transformNodeTracks.forEach((transformNodeTrack) => {
                  const newTrack: PlaskTrack = {
                    ...transformNodeTrack,
                    id: `${layer.id}//${controller.id}//${transformNodeTrack.property}`,
                    targetId: controller.id,
                    target: controller,
                    name: `${transformNodeTrack.name}|controller`,
                    // confirmedToCopy 여부에 따라 controller에 animation keyframes 복사 혹은 빈 transformKeys
                    transformKeys: confirmedToCopy ? [...transformNodeTrack.transformKeys] : [],
                  };
                  newTracks.push(newTrack);
                });
              });
            });

            if (_playState === 'play') {
              forceClickAnimationPauseAndPlay(_playState, _playDirection);
            } else {
              forceClickAnimationPlayAndStop();
            }

            const newAnimationIngredient: AnimationIngredient = { ...currentAnimationIngredient, tracks: [...tracks, ...newTracks] };
            dispatch(animationDataActions.editAnimationIngredient({ animationIngredient: newAnimationIngredient }));
          }
        });
      }
    }
  }, [_animationIngredients, _assetList, _playDirection, _playState, _retargetMaps, _screenList, dispatch, getConfirm, isControllerOn, selectedAssetId]);

  // Filter의 활성화 비활성화
  const handleFilterToggle = useCallback(() => {
    if (selectedAssetId) {
      if (isFilterOn) {
        setIsFilterOn(false);
        // useFilter to false
        const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
        if (targetAnimationIngredient) {
          dispatch(animationDataActions.turnFilterOff({ animationIngredientId: targetAnimationIngredient.id, layerId: _seletedLayer }));
          forceClickAnimationPauseAndPlay(_playState, _playDirection);
        }
      } else {
        setIsFilterOn(true);
        // useFilter to true
        const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
        if (targetAnimationIngredient) {
          dispatch(animationDataActions.turnFilterOn({ animationIngredientId: targetAnimationIngredient.id, layerId: _seletedLayer }));
          forceClickAnimationPauseAndPlay(_playState, _playDirection);
        }
      }
    }
  }, [_animationIngredients, _playDirection, _playState, _seletedLayer, dispatch, isFilterOn, selectedAssetId]);

  const positionInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setPositionX(parseFloat(event.target.value));
            controlTarget.position.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setPositionY(parseFloat(event.target.value));
            controlTarget.position.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setPositionZ(parseFloat(event.target.value));
            controlTarget.position.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.z : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionZ,
    },
  ];

  const eulerInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = new BABYLON.Vector3(parseFloat(event.target.value), prevE.y, prevE.z);
            const q = e.toQuaternion();

            setEulerX(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return q.toEulerAngles().x;
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = new BABYLON.Vector3(prevE.x, parseFloat(event.target.value), prevE.z);
            const q = e.toQuaternion();

            setEulerY(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return q.toEulerAngles().y;
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = new BABYLON.Vector3(prevE.x, prevE.y, parseFloat(event.target.value));
            const q = e.toQuaternion();

            setEulerZ(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return q.toEulerAngles().z;
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerZ,
    },
  ];

  const quaternionInputData = [
    {
      text: 'W',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setQuarternionW(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.w = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.w : 1), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionW,
    },
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setQuarternionX(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setQuarternionY(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setQuarternionZ(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.z : 0), [controlTarget]),
      decimalDigit: 4,
      currnetValue: quarternionZ,
    },
  ];

  const scaleInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setScaleX(parseFloat(event.target.value));
            controlTarget.scaling.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setScaleY(parseFloat(event.target.value));
            controlTarget.scaling.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlTarget) {
            setScaleZ(parseFloat(event.target.value));
            controlTarget.scaling.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleZ,
    },
  ];

  const fkControllerInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlController) {
            setControllerX(parseFloat(event.target.value));
            controlController.scaling.x = parseFloat(event.target.value);
          }
        },
        [controlController],
      ),
      defaultValue: 1,
      decimalDigit: 2,
      currentValue: controllerX,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (controlController) {
            setControllerZ(parseFloat(event.target.value));
            controlController.scaling.z = parseFloat(event.target.value);
          }
        },
        [controlController],
      ),
      defaultValue: 1,
      decimalDigit: 2,
      currentValue: controllerZ,
    },
  ];

  const filterRangeData = [
    {
      text: 'Fcmin',
      step: 0.01,
      currentMax: 10,
      currentValue: fcValue,
      setCurrentValue: setFcValue,
      decimalDigit: 2,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        setFcValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback(
        (inputValue: number) => {
          if (controlTrack) {
            dispatch(animationDataActions.changeTrackFilterMinCutoff({ trackId: controlTrack.id, value: inputValue }));
            // 새로운 animationGroup을 사용하기 위해, 일시정지 후 재생
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, controlTrack, dispatch],
      ),
    },
    {
      text: 'Beta',
      step: 0.001,
      currentMax: 1,
      currentValue: betaValue,
      setCurrentValue: setBetaValue,
      decimalDigit: 3,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        setBetaValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback(
        (inputValue: number) => {
          if (controlTrack) {
            dispatch(animationDataActions.changeTrackFilterBeta({ trackId: controlTrack.id, value: inputValue }));
            // 새로운 animationGroup을 사용하기 위해, 일시정지 후 재생
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, controlTrack, dispatch],
      ),
    },
  ];

  const rotationTypeDropdownData: Array<{ text: PlaskRotationType; handleSelect: Dispatch<SetStateAction<PlaskRotationType>> }> = [
    { text: 'euler', handleSelect: () => setCurrentRotationType('euler') },
    { text: 'quaternion', handleSelect: () => setCurrentRotationType('quaternion') },
  ];

  // const buttonInfo = [
  //   { text: 'Bone', handleBlur: () => {} },
  //   { text: 'Mesh', handleBlur: () => {} },
  //   { text: 'Controller', handleBlur: () => {} },
  // ];

  const handleSelectColor = useCallback(
    (color: PlaskPaletteColor) => {
      if (controlController) {
        setControllerColor(color);
        // @ts-ignore
        controlController.material.emissiveColor = BABYLON.Color3.FromHexString(color);
      }
    },
    [controlController],
  );

  return (
    <Fragment>
      <section className={cx('transform-section')}>
        <AnimationTitleToggle text="Transform" isSpread={isTransformSectionSpread} handleSpread={handleSpreadTransform} activeStatus={isAllActive && !isNull(controlTarget)} />
        <div className={cx('container', { active: isTransformSectionSpread })}>
          <AnimationInputWrapper inputTitle="Position" inputInfo={positionInputData} activeStatus={isAllActive && !isNull(controlTarget)} />
          {currentRotationType === 'euler' ? (
            <AnimationInputWrapper inputTitle="Euler" inputInfo={eulerInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive && !isNull(controlTarget)} />
          ) : (
            // prettier-ignore
            <AnimationInputWrapper inputTitle="Quaternion" inputInfo={quaternionInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive && !isNull(controlTarget)} />
          )}
          <AnimationInputWrapper inputTitle="Scale" inputInfo={scaleInputData} activeStatus={isAllActive && !isNull(controlTarget)} />
          {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
      <section className={cx('fk-controller-section')}>
        <AnimationTitleToggle
          text="FK Controller"
          isSpread={isControllerSectionSpread}
          handleSpread={handleSpreadController}
          isPowerOn={isControllerOn}
          handleToggle={handleControllerToggle}
          withSwitch={true}
          checked={isControllerOn}
          activeStatus={isAllActive && isControllerOn}
          canToggle={!isUndefined(selectedAssetId)}
        />
        <div className={cx('container', { active: isControllerSectionSpread })}>
          <AnimationFKWrapper
            fkInfo={fkControllerInputData}
            activeStatus={isAllActive && isControllerOn && !isNull(controlController)}
            currentColor={controllerColor}
            handleSelectColor={handleSelectColor}
          />
          {(!isAllActive || !isControllerOn || isNull(controlController)) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
      <section className={cx('filter-section')}>
        <AnimationTitleToggle
          text="Filter"
          isSpread={isFilterSectionSpread}
          handleSpread={handleSpreadFilter}
          isPowerOn={isFilterOn}
          handleToggle={handleFilterToggle}
          withSwitch={true}
          checked={isFilterOn}
          activeStatus={isAllActive && isFilterOn}
          canToggle={!isUndefined(selectedAssetId)}
        />
        <div className={cx('container', { active: isFilterSectionSpread })}>
          {filterRangeData.map((info, idx) => (
            <AnimationRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              currentMax={info.currentMax}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive && isFilterOn && !isNull(controlTrack)}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}
          {(!isAllActive || !isFilterOn || isNull(controlTrack)) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
      {/**
       * Visibility Section
       * @alpha
       * Visibility Section is not included on Plask v1.0
       */}
      {/* <section className={cx('visibility-section')}>
        <AnimationTitleToggle text="Visibility" isSpread={isVisibilitySectionSpread} setIsSpread={setIsVisibilitySectionSpread} activeStatus={isAllActive} />
        <div className={cx('container', { active: isVisibilitySectionSpread })}>
          <AnimationButton buttonInfo={buttonInfo} activeStatus={isAllActive}></AnimationButton>
          {!isAllActive && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section> */}
    </Fragment>
  );
};

export default AnimationTab;
