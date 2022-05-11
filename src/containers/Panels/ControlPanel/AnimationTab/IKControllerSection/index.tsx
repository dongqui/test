import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';

import { AnimationTitleToggle, StaticRangeInput } from 'components/ControlPanel';
import { FilledButton } from 'components/Button';
import AnimationInputWrapper from '../AnimationInputWrapper';
import { Nullable, PlaskRetargetMap } from 'types/common';
import { forceClickAnimationPauseAndPlay } from 'utils/common';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import plaskEngine from '3d/PlaskEngine';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
  retargetMaps: Array<PlaskRetargetMap>;
}

const IKControllerSection: FunctionComponent<Props> = ({ isAllActive, selectableObjects, selectedTargets, retargetMaps }) => {
  const _selectableObjects = selectableObjects;
  const _selectedTargets = selectedTargets;
  const _retargetMaps = retargetMaps;

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);

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

  const [poleAngleValue, setPoleAngleValue] = useState<number>(0);
  const [blendValue, setBlendValue] = useState<number>(1);

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
        setBlendValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback((inputValue: number) => {
        // TODO: IK Module (Adjust Blend)
      }, []),
    },
    {
      text: 'Pole Angle',
      step: 0.1,
      min: -270,
      max: 270,
      currentValue: poleAngleValue,
      setCurrentValue: setPoleAngleValue,
      decimalDigit: 1,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        setPoleAngleValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback((inputValue: number) => {
        // TODO: IK Module (Adjust Pole Angle)
      }, []),
    },
  ];

  const IKControllerButtons = [
    {
      text: 'Set IK Pose to FK',
      onClick: () => {
        console.log('Set IK Pose to FK');
      },
    },
    {
      text: 'Set FK Pose to IK',
      onClick: () => {
        console.log('Set FK Pose to IK');
      },
    },
    {
      text: 'Set Bake',
      onClick: () => {
        console.log('Set Bake');
      },
    },
  ];

  const handleSetupIK = useCallback(() => {
    // TODO: IK Module (Create IK Controller)
    if (isIKOn) {
      setIsIKOn(false);
    } else {
      setIsIKOn(true);
    }
  }, [isIKOn]);

  return (
    <section className={cx('ik-section')}>
      <AnimationTitleToggle text="IK Controller" isSpread={isSectionSpread} handleSpread={handleSpreadTransform} activeStatus={isAllActive && !isNull(controlTarget)} />
      <div className={cx('container', { active: isSectionSpread })}>
        {plaskEngine.ikModule.retargetMap ? (
          <div className={cx('inner-container')}>
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
                activeStatus={isAllActive && !isIKOn && !isNull(controlTarget)}
                handleChange={info.handleChange}
                onChangeEnd={info.onChangeEnd}
              />
            ))}

            {IKControllerButtons.map((info, idx) => (
              <FilledButton onClick={info.onClick} className={cx('button')} key={`${info.text}${idx}`} text={info.text} color="default" disabled={!isAllActive} fullSize={true} />
            ))}
          </div>
        ) : (
          <div className={cx('inner-container')}>
            <div className={cx('text')}>Please complete retarget map to enable controllers</div>
            <FilledButton onClick={handleSetupIK} className={cx('button')} text="Set Up IK" color="default" disabled={!(isAllActive && !isNull(controlTarget))} fullSize={true} />
          </div>
        )}

        {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
      </div>
    </section>
  );
};

export default IKControllerSection;
