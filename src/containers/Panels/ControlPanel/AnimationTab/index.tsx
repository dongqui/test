import { Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';
import AnimationInputWrapper from './AnimationInputWrapper';
import AnimationFKWrapper from './AnimationFKWrapper';
import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { Nullable, PlaskPaletteColor, PlaskRotationType, PlaskTrack } from 'types/common';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _seletedLayer = useSelector((state) => state.trackList.selectedLayer); // selectedLayerId에 해당

  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

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

  // FK Controller value를 관리하는 useState
  const [viewX, setViewX] = useState<number>(0);
  const [viewY, setViewY] = useState<number>(0);
  const [palette, setPalette] = useState<PlaskPaletteColor>('yellow');

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

  useEffect(() => {
    if (controlTrack) {
      setIsFilterOn(controlTrack.useFilter);
    }
  }, [controlTrack]);

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

  const fkViewInputData = [
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        setViewX(parseFloat(event.target.value));
        console.log('fkView x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 2,
      currentValue: viewX,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        setViewY(parseFloat(event.target.value));
        console.log('fkView y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 2,
      currentValue: viewY,
    },
  ];

  const filterRangeData = [
    { text: 'Fcmin', step: 0.01, currentMax: 10, currentValue: fcValue, setCurrentValue: setFcValue, decimalDigit: 2 },
    { text: 'Beta', step: 0.001, currentMax: 1, currentValue: betaValue, setCurrentValue: setBetaValue, decimalDigit: 3 },
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

  return (
    <Fragment>
      <section className={cx('transform-section')}>
        <AnimationTitleToggle text="Transform" isSpread={isTransformSectionSpread} setIsSpread={setIsTransformSectionSpread} activeStatus={isAllActive && !isNull(controlTarget)} />
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
          setIsSpread={setIsControllerSectionSpread}
          isPowerOn={isControllerOn}
          setIsPowerOn={setIsControllerOn}
          withSwitch={true}
          checked={isControllerOn}
          activeStatus={isAllActive && isControllerOn}
        />
        <div className={cx('container', { active: isControllerSectionSpread })}>
          <AnimationFKWrapper fkInfo={fkViewInputData} activeStatus={isAllActive && isControllerOn} currentColor={palette} setCurrentColor={setPalette} />
          {(!isAllActive || !isControllerOn) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
      <section className={cx('filter-section')}>
        <AnimationTitleToggle
          text="Filter"
          isSpread={isFilterSectionSpread}
          setIsSpread={setIsFilterSectionSpread}
          isPowerOn={isFilterOn}
          setIsPowerOn={setIsFilterOn}
          withSwitch={true}
          checked={isFilterOn}
          activeStatus={isAllActive && isFilterOn}
        />
        <div className={cx('container', { active: isFilterSectionSpread })}>
          {filterRangeData.map((info, idx) => (
            <AnimationRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              currentMax={info.currentMax}
              currentValue={info.currentValue}
              setCurrentValue={info.setCurrentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive && isFilterOn}
            />
          ))}
          {(!isAllActive || !isFilterOn) && <div className={cx('inactive-overlay')}></div>}
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
