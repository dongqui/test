import { ChangeEvent, FunctionComponent, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { isNull } from 'lodash';
import TagManager from 'react-gtm-module';

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
import { Typography } from 'components/Typography';
import { DEBUG_EL_ID } from 'constants/';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  retargetMaps: Array<PlaskRetargetMap>;
  visualizedAssetIds: Array<string>;
  seletedLayer: string;
  animationIngredients: Array<AnimationIngredient>;
}

const DebugSection: FunctionComponent<React.PropsWithChildren<Props>> = ({ isAllActive, retargetMaps, visualizedAssetIds, seletedLayer, animationIngredients }) => {
  const _animationIngredients = animationIngredients;
  const _selectedLayer = seletedLayer;
  const _retargetMaps = retargetMaps;
  const _visualizedAssetIds = visualizedAssetIds;

  // Check mapped
  const visualizedRetargetMap = useMemo(() => _retargetMaps.find((retargetMap) => retargetMap.assetId === _visualizedAssetIds[0]), [_retargetMaps, _visualizedAssetIds]); // 단일 모델
  const [mappedBones, setMappedBones] = useState<string[]>([]);
  const mappingCompleted = useMemo(() => mappedBones.length === 24, [mappedBones.length]);

  // IK Controller
  const [sigma, setSigma] = useState<number>(1);
  const [convolutionSize, setConvolutionSize] = useState<number>(5);
  const [fcmin, setFcmin] = useState<number>(0.5);
  const [beta, setBeta] = useState<number>(0.007);
  const [threshold, setThreshold] = useState<number>(0.002);

  useEffect(() => {
    if (visualizedRetargetMap) {
      const mappedSourceBoneNames = visualizedRetargetMap.values.filter((value) => !isNull(value.targetTransformNodeId)).map((v) => v.sourceBoneName);
      setMappedBones(mappedSourceBoneNames);
    }
  }, [visualizedRetargetMap]);

  const dispatch = useDispatch();

  const GaussianFilterData = [
    {
      text: 'Convolution size',
      step: 2,
      min: 3,
      max: 15,
      showProgress: true,
      currentValue: convolutionSize,
      setCurrentValue: setConvolutionSize,
      decimalDigit: 0,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Nothing to do
        // plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setConvolutionSize(inputValue);
      }, []),
    },
    {
      text: 'Exponential Sigma',
      step: 0.2,
      min: 0.1,
      max: 10,
      currentValue: sigma,
      setCurrentValue: setSigma,
      decimalDigit: 1,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Nothing to do
        // plaskEngine.ikModule.setIKControllerPoleAngle(Tools.ToRadians(parseFloat(event.target.value)), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setSigma(inputValue);
      }, []),
    },
  ];

  const OneEuroFilterData = [
    {
      text: 'FCMin',
      step: 0.1,
      min: 0.0,
      max: 10,
      showProgress: true,
      currentValue: fcmin,
      setCurrentValue: setFcmin,
      decimalDigit: 1,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Nothing to do
        // plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setFcmin(inputValue);
      }, []),
    },
    {
      text: 'beta',
      step: 0.003,
      min: 0.0,
      max: 1,
      showProgress: true,
      currentValue: beta,
      setCurrentValue: setBeta,
      decimalDigit: 3,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Nothing to do
        // plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setBeta(inputValue);
      }, []),
    },
  ];

  const FilterButtons = [
    {
      text: 'Preview Filter',
      onClick: (method: string) => {
        plaskEngine.animationModule.DEBUG_filter({ sigma, kernelSize: convolutionSize, beta, minCutoff: fcmin, threshold, method });
      },
    },
    {
      text: 'Apply filter to keyframes',
      onClick: (method: string) => {
        const animationIngredient = plaskEngine.animationModule.DEBUG_bake({ sigma, kernelSize: convolutionSize, beta, minCutoff: fcmin, threshold, method })!;
        dispatch(editAnimationIngredient({ animationIngredient }));
      },
    },
  ];

  const SimplifyKeyframesData = [
    {
      text: 'Threshold',
      step: 0.0005,
      min: 0.0005,
      max: 0.05,
      showProgress: true,
      currentValue: threshold,
      setCurrentValue: setThreshold,
      decimalDigit: 4,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // Nothing to do
        // plaskEngine.ikModule.setIKControllerBlend(parseFloat(event.target.value), controllers);
      },
      onChangeEnd: useCallback((inputValue: number) => {
        setThreshold(inputValue);
      }, []),
    },
  ];

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
          Debug tools
          <div className={cx('tag')}>
            <Typography className={cx('text')}>Dev</Typography>
            <div className={cx('overlay')} onMouseEnter={() => setTagToolTip(true)} onMouseLeave={() => setTagToolTip(false)} />
            {tagToolTip && (
              <div className={cx('tooltip')}>
                <div className={cx('arrow')} />
                <Typography type="body">This is only for debugging purposes on the dev version. This will be disabled on the production application.</Typography>
              </div>
            )}
          </div>
        </div>
      }
      type="dropdown"
      dropdownOptions={dropdownOptions}
      activeStatus={isAllActive}
      id={DEBUG_EL_ID}
    >
      <PlaskCard title={<div className={cx('title-wrapper')}>Gaussian Filter</div>} type="dropdown" dropdownOptions={dropdownOptions} activeStatus={isAllActive} id={DEBUG_EL_ID}>
        <div className={cx('wrapper')}>
          {GaussianFilterData.map((info, idx) => (
            <StaticRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              max={info.max}
              min={info.min ?? 0}
              showProgress={info.showProgress}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}

          {FilterButtons.map((info, idx) => (
            <FilledButton
              onClick={() => info.onClick('gaussian')}
              className={cx('button')}
              key={`${info.text}${idx}`}
              text={info.text}
              buttonType="default"
              disabled={!isAllActive}
              fullSize={true}
            />
          ))}
        </div>
      </PlaskCard>
      <PlaskCard title={<div className={cx('title-wrapper')}>One euro Filter</div>} type="dropdown" dropdownOptions={dropdownOptions} activeStatus={isAllActive} id={DEBUG_EL_ID}>
        <div className={cx('wrapper')}>
          {OneEuroFilterData.map((info, idx) => (
            <StaticRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              max={info.max}
              min={info.min ?? 0}
              showProgress={info.showProgress}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}

          {FilterButtons.map((info, idx) => (
            <FilledButton
              onClick={() => info.onClick('oneeuro')}
              className={cx('button')}
              key={`${info.text}${idx}`}
              text={info.text}
              buttonType="default"
              disabled={!isAllActive}
              fullSize={true}
            />
          ))}
        </div>
      </PlaskCard>
      <PlaskCard
        title={<div className={cx('title-wrapper')}>Simplify Keyframes</div>}
        type="dropdown"
        dropdownOptions={dropdownOptions}
        activeStatus={isAllActive}
        id={DEBUG_EL_ID}
      >
        <div className={cx('wrapper')}>
          {SimplifyKeyframesData.map((info, idx) => (
            <StaticRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              max={info.max}
              min={info.min ?? 0}
              showProgress={info.showProgress}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}

          {FilterButtons.map((info, idx) => (
            <FilledButton
              onClick={() => info.onClick('simplify')}
              className={cx('button')}
              key={`${info.text}${idx}`}
              text={info.text}
              buttonType="default"
              disabled={!isAllActive}
              fullSize={true}
            />
          ))}
        </div>
      </PlaskCard>
    </PlaskCard>
  );
};

export default DebugSection;
