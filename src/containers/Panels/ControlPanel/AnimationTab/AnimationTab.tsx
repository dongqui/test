import { Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useEffect, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import AnimationInputWrapper from './AnimationInputWrapper/AnimationInputWrapper';
import AnimationFKWrapper from './AnimationFKWrapper/AnimationFKWrapper';
import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { PlaskRotationType } from 'types/common';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './AnimationTab.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  // const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  // const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);

  // const [controlTarget, setControlTarget] = useState<BABYLON.TransformNode | BABYLON.Mesh | null>(null);
  //
  // useEffect(() => {
  //   if (_selectedTargets.length === 0) {
  //     // 선택되지 않은 경우
  //     if (isAllActive) {
  //       // visualize cancel에 의해서 선택해제된 경우
  //       setControlTarget(null);
  //     } else {
  //       // asset은 visualize 되어 있으나 선택대상이 없는 경우
  //       setControlTarget(_selectableObjects.find((object) => object.name.toLowerCase().includes('armature')) ?? null);
  //     }
  //   } else if (_selectedTargets.length === 1) {
  //     // 단일대상 선택된 경우
  //     setControlTarget(_selectedTargets[0]);
  //   } else {
  //     // 다중대상 선택된 경우
  //     setControlTarget(null);
  //   }
  // }, [_selectableObjects, _selectedTargets, isAllActive]);

  // section spread status
  const [isTransformSectionSpread, setIsTransformSectionSpread] = useState<boolean>(true);
  const [isControllerSectionSpread, setIsControllerSectionSpread] = useState<boolean>(true);
  const [isFilterSectionSpread, setIsFilterSectionSpread] = useState<boolean>(true);
  // const [spreadVisibility, setSpreadVisibility] = useState<boolean>(true);

  // transform section
  const [currentRotationType, setCurrentRotationType] = useState<PlaskRotationType>('euler');

  // controller section
  const [isControllerOn, setIsControllerOn] = useState<boolean>(false);

  // filter section
  const [isFilterOn, setIsFilterOn] = useState<boolean>(false);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);

  const positionInputData = [
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('position x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('position y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Z',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('position z');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
  ];

  const eulerInputData = [
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('euler x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('euler y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Z',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('euler z');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
  ];

  const quaternionInputData = [
    {
      text: 'W',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('quaternion w');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 4,
    },
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('quaternion x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('quaternion y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
    {
      text: 'Z',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('quaternion z');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 0,
      decimalDigit: 4,
    },
  ];

  const scaleInputData = [
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('scale x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 4,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('scale y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 4,
    },
    {
      text: 'Z',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('scale z');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 4,
    },
  ];

  const fkViewInputData = [
    {
      text: 'X',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('fkView x');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 2,
    },
    {
      text: 'Y',
      handleBlur: (event: FocusEvent<HTMLInputElement>) => {
        console.log('fkView y');
        console.log(parseFloat(event.target.value));
      },
      defaultValue: 1,
      decimalDigit: 2,
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
        <AnimationTitleToggle text="Transform" isSpread={isTransformSectionSpread} setIsSpread={setIsTransformSectionSpread} activeStatus={isAllActive} />
        <div className={cx('container', { active: isTransformSectionSpread })}>
          <AnimationInputWrapper inputTitle="Position" inputInfo={positionInputData} activeStatus={isAllActive} />
          {currentRotationType === 'euler' ? (
            <AnimationInputWrapper inputTitle="Euler" inputInfo={eulerInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive} />
          ) : (
            // prettier-ignore
            <AnimationInputWrapper inputTitle="Quaternion" inputInfo={quaternionInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive} />
          )}
          <AnimationInputWrapper inputTitle="Scale" inputInfo={scaleInputData} activeStatus={isAllActive} />
          {!isAllActive && <div className={cx('inactive-overlay')}></div>}
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
          <AnimationFKWrapper fkInfo={fkViewInputData} activeStatus={isAllActive && isControllerOn} />
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
        <AnimationTitleToggle text="Visibility" isSpread={spreadVisibility} setIsSpread={setSpreadVisibility} activeStatus={isAllActive} />
        <div className={cx('container', { active: spreadVisibility })}>
          <AnimationButton buttonInfo={buttonInfo} activeStatus={isAllActive}></AnimationButton>
          {!isAllActive && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section> */}
    </Fragment>
  );
};

export default AnimationTab;
