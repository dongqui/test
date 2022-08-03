import { ChangeEvent, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isNull } from 'lodash';

import { StaticRangeInput } from 'components/ControlPanel';
import { FilledButton } from 'components/Button';
import { PlaskRetargetMap, AnimationIngredient } from 'types/common';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';
import * as globalUIActions from 'actions/Common/globalUI';
import { PlaskCard } from 'components/ControlPanel/Card';
import { editAnimationIngredient } from 'actions/animationDataAction';
import { changeSelectedTargets } from 'actions/trackList';
import { readMetadata } from 'utils/RP/metadata';
import { defaultMultiSelect } from 'actions/selectingDataAction';
import { IKController } from '3d/modules/ik/IKController';
import { Tools } from '@babylonjs/core';
import { addIKAction, removeIKAction } from 'actions/iKAction';
import { removeIK } from 'sagas/RP/ik/removeIK';
import { Typography } from 'components/Typography';
import { IK_CONTROLLER_EL_ID } from 'constants/';
import popupManager from 'utils/PopupManager';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
  retargetMaps: Array<PlaskRetargetMap>;
  visualizedAssetIds: Array<string>;
  seletedLayer: string;
  animationIngredients: Array<AnimationIngredient>;
}

const IKControllerSection: FunctionComponent<Props> = ({
  isAllActive,
  selectableObjects,
  selectedTargets,
  retargetMaps,
  visualizedAssetIds,
  seletedLayer,
  animationIngredients,
}) => {
  const _selectableObjects = selectableObjects;
  const _selectedTargets = selectedTargets;
  const _animationIngredients = animationIngredients;
  const _selectedLayer = seletedLayer;
  const _retargetMaps = retargetMaps;
  const _visualizedAssetIds = visualizedAssetIds;

  // Check mapped
  const visualizedRetargetMap = useMemo(() => _retargetMaps.find((retargetMap) => retargetMap.assetId === _visualizedAssetIds[0]), [_retargetMaps, _visualizedAssetIds]); // 단일 모델
  const [mappedBones, setMappedBones] = useState<string[]>([]);
  const mappingCompleted = useMemo(() => mappedBones.length === 24, [mappedBones.length]);

  // IK Valid
  const [ikValidation, setIkValidation] = useState<boolean>(false);
  const [targetIKControllers, setTargetIKControllers] = useState<Array<IKController>>([]);
  const [isInfluencedChainSelected, setIsInfluencedChainSelected] = useState<boolean>(false);

  // IK Controller
  const [poleAngleValue, setPoleAngleValue] = useState<number>(0);
  const [blendValue, setBlendValue] = useState<number>(1);

  useEffect(() => {
    if (visualizedRetargetMap) {
      const mappedSourceBoneNames = visualizedRetargetMap.values.filter((value) => !isNull(value.targetTransformNodeId)).map((v) => v.sourceBoneName);
      setMappedBones(mappedSourceBoneNames);
    }
  }, [visualizedRetargetMap]);

  const dispatch = useDispatch();

  // select control target according to the selected target
  useEffect(() => {
    const targets = _selectedTargets.filter((target) => readMetadata('ikController', target.reference));
    plaskEngine.ikModule.setSelectedIk(targets.map((ik) => readMetadata('ikController', ik.reference)));
    setTargetIKControllers(targets.map((ik) => readMetadata('ikController', ik.reference)));

    const isInfluencedSelected = _selectedTargets.find((target) => {
      return plaskEngine.ikModule.isInfluencedChain(target);
    });

    setIsInfluencedChainSelected(Boolean(isInfluencedSelected) || targets.length > 0);
  }, [_selectableObjects, _selectedTargets]);

  useEffect(() => {
    setPoleAngleValue(0);
    setBlendValue(1);
    setIkValidation(false);

    // Use only first control target to display active values
    if (targetIKControllers[0]) {
      setIkValidation(true);
      const controller = targetIKControllers[0];
      setBlendValue(controller.blend);
      setPoleAngleValue(Tools.ToDegrees(controller.poleAngle));

      const blendObserver = controller.onBlendUpdatedObservable.add(() => {
        setBlendValue(controller.blend);
      });
      const poleAngleObserver = controller.onPoleAngleUpdatedObservable.add(() => {
        setPoleAngleValue(Tools.ToDegrees(controller.poleAngle));
      });
      return () => {
        controller.onBlendUpdatedObservable.remove(blendObserver);
        controller.onPoleAngleUpdatedObservable.remove(poleAngleObserver);
      };
    }
  }, [targetIKControllers]);

  useEffect(() => {
    popupManager.showIKOnboarding();
    return () => {
      popupManager.closeOnboarding();
    };
  }, []);

  const IKControllerData = [
    {
      text: 'Blend',
      step: 0.1,
      min: 0,
      max: 1,
      showProgress: true,
      currentValue: blendValue,
      setCurrentValue: setBlendValue,
      decimalDigit: 1,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        let controllers: IKController[] = targetIKControllers;

        if (!targetIKControllers.length) {
          _selectedTargets.forEach((target) => {
            const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
            controllers = _temp.map((e, i) => e ?? controllers[i]);
          });

          controllers = controllers.filter((e) => e !== undefined);
        }
        console.log(controllers);
        plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setBlendValue(inputValue);
      }, []),

      active: isInfluencedChainSelected,
    },
    {
      text: 'Pole Angle',
      step: 0.1,
      min: -180,
      max: 180,
      currentValue: poleAngleValue,
      setCurrentValue: setPoleAngleValue,
      decimalDigit: 1,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        let controllers: IKController[] = targetIKControllers;

        if (!targetIKControllers.length) {
          _selectedTargets.forEach((target) => {
            const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
            controllers = _temp.map((e, i) => e ?? controllers[i]);
          });

          controllers = controllers.filter((e) => e !== undefined);
        }
        plaskEngine.ikModule.setIKControllerPoleAngle(Tools.ToRadians(parseFloat(event.target.value)), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setPoleAngleValue(inputValue);
      }, []),

      active: ikValidation,
    },
  ];

  const IKControllerButtons = [
    {
      text: 'Set IK Pose to FK',
      disabled: !isInfluencedChainSelected,
      onClick: () => {
        let controllers: IKController[] = targetIKControllers;

        if (!targetIKControllers.length) {
          _selectedTargets.forEach((target) => {
            const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
            controllers = _temp.map((e, i) => e ?? controllers[i]);
          });

          controllers = controllers.filter((e) => e !== undefined);
        }
        if (controllers.length > 0) {
          plaskEngine.ikModule.setIKtoFK(controllers);
          plaskEngine.ikModule.setIKControllerBlend(1);
          setBlendValue(1);
        }
      },
    },
    {
      text: 'Set FK Pose to IK',
      onClick: () => {
        let controllers: IKController[] = targetIKControllers;

        if (!targetIKControllers.length) {
          _selectedTargets.forEach((target) => {
            const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
            controllers = _temp.map((e, i) => e ?? controllers[i]);
          });

          controllers = controllers.filter((e) => e !== undefined);
        }
        if (controllers.length > 0) plaskEngine.ikModule.setFKtoIK(controllers);
      },
      disabled: !isInfluencedChainSelected,
    },
    {
      text: 'Bake IK into FK',
      disabled: !isInfluencedChainSelected,
      onClick: () => {
        try {
          dispatch(globalUIActions.openModal('LoadingModal', { title: 'Baking the IK controllers', message: 'This can take up to 3 minutes' }));

          // TODO Need to Fix
          setTimeout(() => {
            let controllers: IKController[] = targetIKControllers;

            if (!targetIKControllers.length) {
              _selectedTargets.forEach((target) => {
                const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
                controllers = _temp.map((e, i) => e ?? controllers[i]);
              });

              controllers = controllers.filter((e) => e !== undefined);
            }
            const { animationIngredient, impactedIK } = plaskEngine.ikModule.bakeFKintoIK(controllers);
            if (animationIngredient) {
              dispatch(editAnimationIngredient({ animationIngredient }));
            }

            // Set FK position to newly updated values
            plaskEngine.ikModule.setIKtoFK();

            // Select baked FK so the user notices the change
            dispatch(defaultMultiSelect({ targets: impactedIK }));

            // Refresh tracks by forcing the selection update.
            // Could be better using ADD_KEYFRAME
            dispatch(changeSelectedTargets());
            dispatch(globalUIActions.closeModal('LoadingModal'));
          }, 100);
        } catch (e) {
          console.log(e);
        } finally {
        }
      },
    },
    {
      text: 'Bake FK into IK',

      disabled: !isInfluencedChainSelected,
      onClick: () => {
        try {
          dispatch(globalUIActions.openModal('LoadingModal', { title: 'Baking the bones', message: 'This can take up to 3 minutes' }));

          // TODO Need to Fix
          setTimeout(() => {
            let controllers: IKController[] = targetIKControllers;

            if (!targetIKControllers.length) {
              _selectedTargets.forEach((target) => {
                const _temp = plaskEngine.ikModule.getControllerByInfluencedChain(target);
                controllers = _temp.map((e, i) => e ?? controllers[i]);
              });

              controllers = controllers.filter((e) => e !== undefined);
            }
            const { animationIngredient, impactedFK } = plaskEngine.ikModule.bakeIKintoFK(controllers);
            if (animationIngredient) {
              dispatch(editAnimationIngredient({ animationIngredient }));
            }

            // Set FK position to newly updated values
            plaskEngine.ikModule.setFKtoIK();

            // Select baked FK so the user notices the change
            dispatch(defaultMultiSelect({ targets: impactedFK }));

            // Refresh tracks by forcing the selection update.
            // Could be better using ADD_KEYFRAME
            dispatch(changeSelectedTargets());
            dispatch(globalUIActions.closeModal('LoadingModal'));
          }, 100);
        } catch (e) {
          console.log(e);
        } finally {
        }
      },
    },
  ];

  const handleSetupIK = useCallback(() => {
    const assetId = _visualizedAssetIds[0];
    dispatch(addIKAction(assetId));

    if (!popupManager.isIKOnboardingDone) {
      popupManager.doneIKOnboarding();
    }
  }, [dispatch, _visualizedAssetIds]);

  const dropdownOptions = {
    active: plaskEngine.ikModule.ikControllers.length > 0,
    items: [
      {
        text: 'Delete all IK controllers',
        handleSelect: useCallback(() => {
          dispatch(
            globalUIActions.openModal('ConfirmModal', {
              title: 'Delete all ik controllers?',
              message: 'This action will delete all IK controllers',
              confirmText: 'Delete',
              onConfirm: () => {
                dispatch(removeIKAction(_visualizedAssetIds[0]));
              },
              cancelText: 'Cancel',
              confirmButtonColor: 'negative',
            }),
          );
        }, [dispatch, _visualizedAssetIds]),
      },
    ],
  };
  const [tagToolTip, setTagToolTip] = useState(false);

  return (
    <PlaskCard
      title={
        <div className={cx('title-wrapper')}>
          IK Controller
          <div className={cx('tag')}>
            <Typography className={cx('text')}>Beta</Typography>
            <div className={cx('overlay')} onMouseEnter={() => setTagToolTip(true)} onMouseLeave={() => setTagToolTip(false)} />
            {tagToolTip && (
              <div className={cx('tooltip')}>
                <div className={cx('arrow')} />
                <Typography type="body">
                  All items related to the IK controller cannot be saved yet. Please export your result before leaving here. Or you can simply bake IK keyframes to the FK.
                </Typography>
              </div>
            )}
          </div>
        </div>
      }
      type="dropdown"
      dropdownOptions={dropdownOptions}
      activeStatus={isAllActive}
      id={IK_CONTROLLER_EL_ID}
    >
      {plaskEngine.ikModule.ikControllers.length > 0 ? (
        <div className={cx('wrapper')}>
          {IKControllerData.map((info, idx) => (
            <StaticRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              max={info.max}
              min={info.min ?? 0}
              showProgress={info.showProgress}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive && info.active}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}

          {IKControllerButtons.map((info, idx) => (
            <FilledButton
              onClick={info.onClick}
              className={cx('button')}
              key={`${info.text}${idx}`}
              text={info.text}
              buttonType="default"
              disabled={!isAllActive || info.disabled}
              fullSize={true}
            />
          ))}
        </div>
      ) : (
        <div className={cx('wrapper')}>
          {mappingCompleted ? (
            <div className={cx('text')}>Create IK Controller to continue</div>
          ) : (
            <div className={cx('text')}>Please complete retarget map to enable controllers</div>
          )}
          <FilledButton
            onClick={handleSetupIK}
            className={cx('button')}
            text="Set Up IK"
            buttonType="default"
            disabled={!isAllActive || !mappingCompleted || targetIKControllers.length > 0}
            fullSize={true}
          />
        </div>
      )}
      {!(isAllActive && targetIKControllers.length == 0) && <div className={cx('inactive-overlay')}></div>}
    </PlaskCard>
  );
};

export default IKControllerSection;
