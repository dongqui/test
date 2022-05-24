import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
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

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);

  useEffect(() => {
    if (visualizedRetargetMap) {
      const mappedSourceBoneNames = visualizedRetargetMap.values.filter((value) => !isNull(value.targetTransformNodeId)).map((v) => v.sourceBoneName);
      setMappedBones(mappedSourceBoneNames);
    }
  }, [visualizedRetargetMap]);

  const dispatch = useDispatch();

  // select control target according to the selected target
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // case nothing is selected
      setControlTarget(null);
    } else if (_selectedTargets.length === 1) {
      // case single target is selected
      setControlTarget(_selectedTargets[0].reference);
    } else {
      // case multi targets are selected
      setControlTarget(null);
    }
  }, [_selectableObjects, _selectedTargets]);

  // IK Valid
  const [isIKOn, setIsIKOn] = useState<boolean>(false);

  // IK Controller
  const [poleAngleValue, setPoleAngleValue] = useState<number>(0);
  const [blendValue, setBlendValue] = useState<number>(1);

  useEffect(() => {
    setIsIKOn(true);
    const controller = controlTarget ? readMetadata('ikController', controlTarget) : null;
    if (controller) {
      // TODO: Temp approach, need to check
      console.log(`ControlTarget Blend: ${controller.blend}`);
      console.log(`ControlTarget Angle: ${controller.poleAngle}`);
      setBlendValue(controller.blend);
      setPoleAngleValue(BABYLON.Tools.ToDegrees(controller.poleAngle));
    } else {
      console.log('Reset');
      setPoleAngleValue(0);
      setBlendValue(1);
      setIsIKOn(false);
    }
  }, [controlTarget]);

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
        plaskEngine.ikModule.setIKControllerPoleAngle(BABYLON.Tools.ToRadians(parseFloat(event.target.value)));
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
      },
    },
    {
      text: 'Set FK Pose to IK',
      onClick: () => {
        plaskEngine.ikModule.setFKtoIK();
      },
    },
    {
      text: 'Keyframe IK',
      onClick: () => {
        const animationIngredient = plaskEngine.ikModule.getIKKeyframeData();
        if (animationIngredient) {
          dispatch(editAnimationIngredient(animationIngredient));
          // Set FK to IK to reflect the current animation that has been updated
          plaskEngine.ikModule.setFKtoIK();

          // Refresh tracks by forcing the selection update.
          // Could be better using ADD_KEYFRAME
          dispatch(changeSelectedTargets());
        }
      },
    },
  ];

  const handleSetupIK = useCallback(() => {
    dispatch(
      commonActions.openModal('ConfirmModal', {
        title: 'Setup IK',
        message: 'This action will create IK controllers',
        confirmText: 'Confirm',
        onConfirm: () => {
          // TODO: IK Module (Create IK Controller)
        },
        cancelText: 'Cancel',
        confirmButtonColor: 'primary',
      }),
    );
  }, [dispatch]);

  const dropdownOptions = [
    {
      text: 'Delete all IK controllers',
      handleSelect: () => {
        dispatch(
          commonActions.openModal('ConfirmModal', {
            title: 'Delete all ik controllers?',
            message: 'This action will delete all IK controllers',
            confirmText: 'Delete',
            onConfirm: () => {
              plaskEngine.ikModule.removeIK();
            },
            cancelText: 'Cancel',
            confirmButtonColor: 'negative',
          }),
        );
      },
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
              color="default"
              disabled={!isAllActive || !isIKOn}
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
      {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
    </PlaskCard>
  );
};

export default IKControllerSection;
