import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import * as BABYLON from '@babylonjs/core';
import { isNull, isUndefined } from 'lodash';

import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import AnimationInputWrapper from '../AnimationInputWrapper';
import { Nullable, PlaskLayer, PlaskRotationType, PlaskTrack } from 'types/common';
import { convertToDegree, convertToRadian, forceClickAnimationPauseAndPlay } from 'utils/common';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskCard } from 'components/ControlPanel/Card';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import PlaskEngine from '3d/PlaskEngine';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
}

const TransformSection: FunctionComponent<Props> = ({ isAllActive, selectableObjects, selectedTargets }) => {
  const _selectableObjects = selectableObjects;
  const _selectedTargets = selectedTargets;

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlLayer, setControlLayer] = useState<Nullable<PlaskLayer>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

  // useState for position value
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [positionZ, setPositionZ] = useState<number>(0);

  // useState for euler value
  const [eulerX, setEulerX] = useState<number>(0);
  const [eulerY, setEulerY] = useState<number>(0);
  const [eulerZ, setEulerZ] = useState<number>(0);

  // useState for quaternion value
  const [quarternionW, setQuarternionW] = useState<number>(1);
  const [quarternionX, setQuarternionX] = useState<number>(0);
  const [quarternionY, setQuarternionY] = useState<number>(0);
  const [quarternionZ, setQuarternionZ] = useState<number>(0);

  // useState for scaling value
  const [scaleX, setScaleX] = useState<number>(0);
  const [scaleY, setScaleY] = useState<number>(0);
  const [scaleZ, setScaleZ] = useState<number>(0);

  // select control target according to the selected target
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // case nothing is selected
      setControlTarget(null);
    } else if (_selectedTargets.length === 1) {
      // case single target is selected
      console.log(_selectedTargets[0].reference.getPlaskEntity());
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
        setPositionX(position.x);
        setPositionY(position.y);
        setPositionZ(position.z);

        const e = rotationQuaternion!.clone().toEulerAngles();
        setEulerX(convertToDegree(e.x));
        setEulerY(convertToDegree(e.y));
        setEulerZ(convertToDegree(e.z));

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
  }, [controlTarget]);

  // section spread status
  const [isTransformSectionSpread, setIsTransformSectionSpread] = useState<boolean>(true);

  // callback to spread/fold transform section
  const handleSpreadTransform = useCallback(() => {
    if (isTransformSectionSpread) {
      setIsTransformSectionSpread(false);
    } else {
      setIsTransformSectionSpread(true);
    }
  }, [isTransformSectionSpread]);
  const inputData = {
    position: [
      {
        text: 'X',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setPositionX(parseFloat(event.target.value));
              controlTarget.position.x = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.position.x : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${positionX}`,
      },
      {
        text: 'Y',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setPositionY(parseFloat(event.target.value));
              controlTarget.position.y = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.position.y : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${positionY}`,
      },
      {
        text: 'Z',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setPositionZ(parseFloat(event.target.value));
              controlTarget.position.z = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.position.z : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${positionZ}`,
      },
    ],
    euler: [
      {
        text: 'X',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
              const e = prevE.clone();
              e.x = convertToRadian(parseFloat(event.target.value));
              const q = e.toQuaternion();

              setEulerX(parseFloat(event.target.value));
              controlTarget.rotationQuaternion = q;
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => {
          if (controlTarget) {
            const q = controlTarget.rotationQuaternion!.clone();
            return convertToDegree(q.toEulerAngles().x);
          } else {
            return 0;
          }
        }, [controlTarget]),
        decimalDigit: 4,
        currentValue: `${eulerX}`,
      },
      {
        text: 'Y',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
              const e = prevE.clone();
              e.y = convertToRadian(parseFloat(event.target.value));
              const q = e.toQuaternion();

              setEulerY(parseFloat(event.target.value));
              controlTarget.rotationQuaternion = q;
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => {
          if (controlTarget) {
            const q = controlTarget.rotationQuaternion!.clone();
            return convertToDegree(q.toEulerAngles().y);
          } else {
            return 0;
          }
        }, [controlTarget]),
        decimalDigit: 4,
        currentValue: `${eulerY}`,
      },
      {
        text: 'Z',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
              const e = prevE.clone();
              e.z = convertToRadian(parseFloat(event.target.value));
              const q = e.toQuaternion();

              setEulerZ(parseFloat(event.target.value));
              controlTarget.rotationQuaternion = q;
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => {
          if (controlTarget) {
            const q = controlTarget.rotationQuaternion!.clone();
            return convertToDegree(q.toEulerAngles().z);
          } else {
            return 0;
          }
        }, [controlTarget]),
        decimalDigit: 4,
        currentValue: `${eulerZ}`,
      },
    ],
    quaternion: [
      {
        text: 'W',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setQuarternionW(parseFloat(event.target.value));
              controlTarget.rotationQuaternion!.w = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.w : 1), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${quarternionW}`,
      },
      {
        text: 'X',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setQuarternionX(parseFloat(event.target.value));
              controlTarget.rotationQuaternion!.x = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.x : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${quarternionX}`,
      },
      {
        text: 'Y',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setQuarternionY(parseFloat(event.target.value));
              controlTarget.rotationQuaternion!.y = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.y : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${quarternionY}`,
      },
      {
        text: 'Z',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setQuarternionZ(parseFloat(event.target.value));
              controlTarget.rotationQuaternion!.z = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.z : 0), [controlTarget]),
        decimalDigit: 4,
        currnetValue: `${quarternionZ}`,
      },
    ],
    scale: [
      {
        text: 'X',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setScaleX(parseFloat(event.target.value));
              controlTarget.scaling.x = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${scaleX}`,
      },
      {
        text: 'Y',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setScaleY(parseFloat(event.target.value));
              controlTarget.scaling.y = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${scaleY}`,
      },
      {
        text: 'Z',
        handleBlur: useCallback(
          (event: FocusEvent<HTMLInputElement>) => {
            if (isNaN(parseFloat(event.target.value))) {
              return;
            }

            if (controlTarget) {
              setScaleZ(parseFloat(event.target.value));
              controlTarget.scaling.z = parseFloat(event.target.value);
              controlTarget.getPlaskEntity().fromTransformNode();
              PlaskEngine.userAction([controlTarget.getPlaskEntity()]);
            }
          },
          [controlTarget],
        ),
        defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
        decimalDigit: 4,
        currentValue: `${scaleZ}`,
      },
    ],
  };
  // transform section
  const [currentRotationType, setCurrentRotationType] = useState<PlaskRotationType>('euler');

  const rotationTypeDropdownData: Array<{ text: PlaskRotationType; handleSelect: Dispatch<SetStateAction<PlaskRotationType>> }> = [
    { text: 'euler', handleSelect: () => setCurrentRotationType('euler') },
    { text: 'quaternion', handleSelect: () => setCurrentRotationType('quaternion') },
  ];

  return (
    <PlaskCard title="Transform" activeStatus={isAllActive && !isNull(controlTarget)}>
      <AnimationInputWrapper
        inputTitle="Position"
        inputInfo={inputData.position}
        activeStatus={isAllActive && !isNull(controlTarget) && controlTarget.getPlaskEntity().transformable.position}
      />
      {currentRotationType === 'euler' ? (
        <AnimationInputWrapper
          inputTitle="Euler"
          inputInfo={inputData.euler}
          dropdownList={rotationTypeDropdownData}
          activeStatus={isAllActive && !isNull(controlTarget) && controlTarget.getPlaskEntity().transformable.rotation.eular}
        />
      ) : (
        // prettier-ignore
        <AnimationInputWrapper inputTitle="Quaternion" inputInfo={inputData.quaternion} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive && !isNull(controlTarget) && controlTarget.getPlaskEntity().transformable.rotation.quaternion} />
      )}
      <AnimationInputWrapper
        inputTitle="Scale"
        inputInfo={inputData.scale}
        activeStatus={isAllActive && !isNull(controlTarget) && controlTarget.getPlaskEntity().transformable.scale}
      />
      {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
    </PlaskCard>
  );
};

export default TransformSection;
