import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
import { isNull, isUndefined } from 'lodash';

import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { FilledButton } from 'components/Button';
import AnimationInputWrapper from '../AnimationInputWrapper';
import { Nullable, PlaskLayer, PlaskRotationType, PlaskTrack } from 'types/common';
import { convertToDegree, convertToRadian, forceClickAnimationPauseAndPlay } from 'utils/common';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
}

const IKControllerSection: FunctionComponent<Props> = ({ isAllActive, selectableObjects, selectedTargets }) => {
  const _selectableObjects = selectableObjects;
  const _selectedTargets = selectedTargets;

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlLayer, setControlLayer] = useState<Nullable<PlaskLayer>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

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

  // set states related to target's properties when target's matrix is updated
  useEffect(() => {
    if (controlTarget) {
      const matrixUpdateObservable = controlTarget.onAfterWorldMatrixUpdateObservable.add((target) => {
        const { position, rotationQuaternion, scaling } = target;
      });

      return () => {
        controlTarget.onAfterWorldMatrixUpdateObservable.remove(matrixUpdateObservable);
      };
    }
  }, [controlTarget]);

  // section spread status
  const [isSectionSpread, setIsSectionSpread] = useState<boolean>(true);

  // callback to spread/fold transform section
  const handleSpreadTransform = useCallback(() => {
    if (isSectionSpread) {
      setIsSectionSpread(false);
    } else {
      setIsSectionSpread(true);
    }
  }, [isSectionSpread]);

  // IK Valid
  const [isIKOn, setIsIKOn] = useState<boolean>(false);

  const [chainValue, setChainValue] = useState<number>(3);
  // useEffect(() => {
  //   if (selectedAssetId) {
  //     const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
  //     const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _seletedLayer);

  //     if (targetLayer) {
  //       const useFilter = targetLayer.useFilter;
  //       setIsFilterOn(useFilter);
  //     } else {
  //       setIsFilterOn(false);
  //     }
  //   } else {
  //     setIsFilterOn(false);
  //   }
  // }, [_animationIngredients, _seletedLayer, selectedAssetId]);

  const IKControllerData = [
    {
      text: 'Chain',
      step: 0.01,
      currentMax: 3,
      currentValue: chainValue,
      setCurrentValue: setChainValue,
      decimalDigit: 2,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        // IK Module Call
        console.log('CHANGED');
      },
      onChangeEnd: useCallback((inputValue: number) => {
        console.log('change End');
        // if (controlTrack) {
        //   dispatch(animationDataActions.changeTrackFilterMinCutoff({ layerId: _seletedLayer, trackId: controlTrack.id, value: inputValue }));
        //   // @TODO anti-pattern
        //   // to use new animationGroup, click pause and play button
        //   forceClickAnimationPauseAndPlay(_playState, _playDirection);
        // }
      }, []),
    },
  ];
  return (
    <section className={cx('ik-section')}>
      <AnimationTitleToggle text="IK Controller" isSpread={isSectionSpread} handleSpread={handleSpreadTransform} activeStatus={isAllActive && !isNull(controlTarget)} />
      <div className={cx('container', { active: isSectionSpread })}>
        {IKControllerData.map((info, idx) => (
          <AnimationRangeInput
            key={`${info.text}${idx}`}
            text={info.text}
            step={info.step}
            currentMax={info.currentMax}
            currentValue={info.currentValue}
            decimalDigit={info.decimalDigit}
            activeStatus={isAllActive}
            handleChange={info.handleChange}
            onChangeEnd={info.onChangeEnd}
          />
        ))}
        <FilledButton text="Set Up IK" color="primary" disabled={!(isAllActive && !isNull(controlTarget))} fullSize={true} />
        {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
      </div>
    </section>
  );
};

export default IKControllerSection;
