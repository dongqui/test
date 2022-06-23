import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isNull } from 'lodash';

import { StaticRangeInput } from 'components/ControlPanel';
import { FilledButton } from 'components/Button';
import AnimationInputWrapper from '../AnimationInputWrapper';
import { Nullable, PlaskRetargetMap, PlaskTrack, PlaskLayer, AnimationIngredient } from 'types/common';
import { forceClickAnimationPauseAndPlay } from 'utils/common';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';

import * as commonActions from 'actions/Common/globalUI';
import { PlaskCard } from 'components/ControlPanel/Card';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { editAnimationIngredient } from 'actions/animationDataAction';
import { changeSelectedTargets } from 'actions/trackList';
import { readMetadata } from 'utils/RP/metadata';
import { addEntity, addSelectableObjects, defaultMultiSelect, removeEntity, removeSelectableObjects } from 'actions/selectingDataAction';
import { IKController } from '3d/modules/ik/IKController';
import { Tools } from '@babylonjs/core';
import { addIKAction, removeIKAction } from 'actions/iKAction';
import { removeIK } from 'sagas/RP/ik/removeIK';
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

  const [controlTargets, setControlTargets] = useState<Array<PlaskTransformNode>>([]);

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
    setControlTargets(targets);
  }, [_selectableObjects, _selectedTargets]);

  // IK Valid
  const [isIKOn, setIsIKOn] = useState<boolean>(false);

  // IK Controller
  const [poleAngleValue, setPoleAngleValue] = useState<number>(0);
  const [blendValue, setBlendValue] = useState<number>(1);

  useEffect(() => {
    setPoleAngleValue(0);
    setBlendValue(1);
    setIsIKOn(false);

    // Use only first control target to display active values
    if (controlTargets[0]) {
      const controller = readMetadata('ikController', controlTargets[0].reference) as IKController;
      if (controller) {
        setIsIKOn(true);
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
    }
  }, [controlTargets]);

  // Updating blend and pole angle from 3D
  useEffect(() => {});

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
        plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setBlendValue(inputValue);
      }, []),
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
        // setPoleAngleValue(parseFloat(event.target.value));
        plaskEngine.ikModule.setIKControllerPoleAngle(Tools.ToRadians(parseFloat(event.target.value)));
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setPoleAngleValue(inputValue);
      }, []),
    },
  ];

  const IKControllerButtons = [
    {
      text: 'Set IK Pose to FK',
      onClick: () => {
        plaskEngine.ikModule.setIKtoFK();
        plaskEngine.ikModule.setIKControllerBlend(1);
        setBlendValue(1);
      },
      disabled: false,
    },
    {
      text: 'Set FK Pose to IK',
      onClick: () => {
        plaskEngine.ikModule.setFKtoIK();
      },
      disabled: false,
    },
    {
      text: 'Bake all FK into IK',
      onClick: () => {
        const { animationIngredients, impactedIK } = plaskEngine.ikModule.bakeAllFKintoIK();
        for (const animationIngredient of animationIngredients) {
          dispatch(editAnimationIngredient({ animationIngredient }));
        }

        // Set FK position to newly updated values
        plaskEngine.ikModule.setIKtoFK();

        // Select baked FK so the user notices the change
        dispatch(defaultMultiSelect({ targets: impactedIK }));

        // Refresh tracks by forcing the selection update.
        // Could be better using ADD_KEYFRAME
        dispatch(changeSelectedTargets());
      },
      disabled: false,
    },
    {
      text: 'Bake all IK into FK',

      onClick: () => {
        const { animationIngredients, impactedFK } = plaskEngine.ikModule.bakeAllIKintoFK();
        for (const animationIngredient of animationIngredients) {
          dispatch(editAnimationIngredient({ animationIngredient }));
        }

        // Set FK position to newly updated values
        plaskEngine.ikModule.setFKtoIK();

        // Select baked FK so the user notices the change
        dispatch(defaultMultiSelect({ targets: impactedFK }));

        // Refresh tracks by forcing the selection update.
        // Could be better using ADD_KEYFRAME
        dispatch(changeSelectedTargets());
      },
      disabled: false,
    },
    {
      text: 'Reset to initial pose',
      onClick: () => {},
    },
  ];

  const handleSetupIK = useCallback(() => {
    dispatch(
      commonActions.openModal('ConfirmModal', {
        title: 'Setup IK',
        message: 'This action will create IK controllers',
        confirmText: 'Confirm',
        onConfirm: () => {
          const assetId = _visualizedAssetIds[0];
          dispatch(addIKAction(assetId));
        },
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
      }),
    );
  }, [dispatch, _visualizedAssetIds]);

  const dropdownOptions = [
    {
      text: 'Delete all IK controllers',
      handleSelect: useCallback(() => {
        dispatch(
          commonActions.openModal('ConfirmModal', {
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
  ];

  return (
    <PlaskCard title="IK Controller" type="dropdown" dropdownOptions={dropdownOptions} activeStatus={isAllActive}>
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
              activeStatus={isAllActive && isIKOn}
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
              type="default"
              disabled={!isAllActive || !isIKOn || info.disabled}
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
            color="default"
            disabled={!isAllActive || !mappingCompleted || plaskEngine.ikModule.ikControllers.length > 0}
            fullSize={true}
          />
        </div>
      )}
      {!(isAllActive && controlTargets.length == 0) && <div className={cx('inactive-overlay')}></div>}
    </PlaskCard>
  );
};

export default IKControllerSection;
