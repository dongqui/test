import { FunctionComponent, useState } from 'react';
import AnimationInputWrapper from './AnimationInputWrapper/AnimationInputWrapper';
import { AnimationButton, AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import AnimationFKWrapper from './AnimationFKWrapper/AnimationFKWrapper';
import classNames from 'classnames/bind';
import styles from './AnimationTab.module.scss';

const cx = classNames.bind(styles);

const AnimationTab: FunctionComponent = () => {
  const [isAllActive, setIsTotalSectionActive] = useState<boolean>(false);
  const [spreadTransform, setSpreadTransform] = useState<boolean>(true);
  const [spreadVisibility, setSpreadVisibility] = useState<boolean>(true);
  const [spreadFk, setSpreadFk] = useState<boolean>(true);
  const [toggleFk, setToggleFk] = useState<boolean>(true);
  const [spreadFilter, setSpreadFilter] = useState<boolean>(true);
  const [toggleFilter, setToggleFilter] = useState<boolean>(true);
  const [isEuler, setIsEuler] = useState<boolean>(true);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);
  const [changeMenu, setChangeMenu] = useState<string>('');

  const position = [
    { text: 'X', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Y', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Z', func: () => {}, defaultValue: 0, decimalDigit: 4 },
  ];

  const euler = [
    { text: 'X', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Y', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Z', func: () => {}, defaultValue: 0, decimalDigit: 4 },
  ];

  const quaternion = [
    { text: 'W', func: () => {}, defaultValue: 1, decimalDigit: 4 },
    { text: 'X', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Y', func: () => {}, defaultValue: 0, decimalDigit: 4 },
    { text: 'Z', func: () => {}, defaultValue: 0, decimalDigit: 4 },
  ];

  const scale = [
    { text: 'X', func: () => {}, defaultValue: 1, decimalDigit: 4 },
    { text: 'Y', func: () => {}, defaultValue: 1, decimalDigit: 4 },
    { text: 'Z', func: () => {}, defaultValue: 1, decimalDigit: 4 },
  ];

  const buttonInfo = [
    { text: 'Bone', func: () => {} },
    { text: 'Mesh', func: () => {} },
    { text: 'Controller', func: () => {} },
  ];

  const fkInfo = [
    { text: 'X', func: () => {}, defaultValue: 1, decimalDigit: 4 },
    { text: 'Y', func: () => {}, defaultValue: 1, decimalDigit: 4 },
  ];

  const filterInfo = [
    { text: 'Fcmin', step: 0.01, currentMax: 10, currentValue: fcValue, setCurrentValue: setFcValue, decimalDigit: 2 },
    { text: 'Beta', step: 0.001, currentMax: 1, currentValue: betaValue, setCurrentValue: setBetaValue, decimalDigit: 3 },
  ];

  const dropdownList = [{ text: 'Euler' }, { text: 'Quaternion' }];

  return (
    <div className={cx('panel-wrap')}>
      <section className={cx('panel-transform')}>
        <AnimationTitleToggle text="Transform" spreadRef={spreadTransform} setSpreadRef={setSpreadTransform} />
        <div className={cx('container', { active: spreadTransform })}>
          <AnimationInputWrapper inputTitle="Position" inputInfo={position} />
          {isEuler && <AnimationInputWrapper inputTitle="Euler" inputInfo={euler} dropdownList={dropdownList} setIsEuler={setIsEuler} />}
          {!isEuler && <AnimationInputWrapper inputTitle="Quaternion" inputInfo={quaternion} dropdownList={dropdownList} setIsEuler={setIsEuler} />}
          <AnimationInputWrapper inputTitle="Scale" inputInfo={scale} />
        </div>
      </section>
      <section className={cx('panel-visibility')}>
        <AnimationTitleToggle text="Visibility" spreadRef={spreadVisibility} setSpreadRef={setSpreadVisibility} />
        <div className={cx('container', { active: spreadVisibility })}>
          <AnimationButton buttonInfo={buttonInfo}></AnimationButton>
        </div>
      </section>
      <section className={cx('panel-fk-controller')}>
        <AnimationTitleToggle
          text="FK Controller"
          spreadRef={spreadFk}
          setSpreadRef={setSpreadFk}
          toggleRef={toggleFk}
          setToggleRef={setToggleFk}
          addSwitch={true}
          checked={toggleFk}
          activeStatus={toggleFk}
        />
        <div className={cx('container', { active: spreadFk })}>
          <AnimationFKWrapper fkInfo={fkInfo} activeStatus={toggleFk} />
          {!toggleFk && <div className={cx('toggle-overlay')}></div>}
        </div>
      </section>
      <section className={cx('panel-filter')}>
        <AnimationTitleToggle
          text="Filter"
          spreadRef={spreadFilter}
          setSpreadRef={setSpreadFilter}
          toggleRef={toggleFilter}
          setToggleRef={setToggleFilter}
          addSwitch={true}
          checked={toggleFilter}
          activeStatus={toggleFilter}
        />
        <div className={cx('container', { active: spreadFilter })}>
          {filterInfo.map((info, idx) => (
            <AnimationRangeInput
              key={idx}
              text={info.text}
              step={info.step}
              currentMax={info.currentMax}
              currentValue={info.currentValue}
              setCurrentValue={info.setCurrentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={toggleFilter}
            />
          ))}
          {!toggleFilter && <div className={cx('toggle-overlay')}></div>}
        </div>
      </section>
    </div>
  );
};

export default AnimationTab;
