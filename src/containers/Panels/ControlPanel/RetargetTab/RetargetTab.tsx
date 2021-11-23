import { FunctionComponent, useState, useCallback, memo } from 'react';
import { AnimationRangeInput, AnimationTitleToggle } from 'components/ControlPanel';
import { IconWrapper, SvgPath } from 'components/Icon';
import DropdownWrapper from 'components/ControlPanel/DropdownWrapper';
import classNames from 'classnames/bind';
import styles from './RetargetTab.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const RetargetTab: FunctionComponent<Props> = ({ isAllActive }) => {
  // const [isAllActive, setIsAllActive] = useState<boolean>(true);
  const [spreadMapping, setSpreadMapping] = useState<boolean>(true);
  const [currentSource, setCurrentSource] = useState<string>('Option1');
  const [currentTarget, setCurrentTarget] = useState<string>('Option2');
  const [currentHipValue, setCurrentHipValue] = useState<number>(0);
  const [selectedJoints, setSelectedJoints] = useState<string[]>([]);

  const handleJoints = useCallback(
    (e) => {
      if (selectedJoints.includes(e.target.id)) {
        setSelectedJoints(selectedJoints.filter((joint) => joint !== e.target.id));
      } else {
        setSelectedJoints(selectedJoints.concat(e.target.id));
      }
    },
    [selectedJoints],
  );

  const jointList = [
    { left: 92, top: 23, id: 'head' },
    { left: 92, top: 96, id: 'spine2' },
    { left: 92, top: 57, id: 'neck' },
    { left: 92, top: 124, id: 'spine1' },
    { left: 92, top: 152, id: 'spine' },
    { left: 92, top: 186, id: 'hips' },
    { left: 83, top: 72, id: 'leftShoulder' },
    { left: 57, top: 78, id: 'leftArm' },
    { left: 47, top: 130, id: 'leftForeArm' },
    { left: 29, top: 163, id: 'leftHand' },
    { left: 71, top: 201, id: 'leftUpLeg' },
    { left: 69, top: 255, id: 'leftLeg' },
    { left: 66, top: 327, id: 'leftFoot' },
    { left: 63, top: 352, id: 'leftToeBase' },
    { left: 20, top: 181, id: 'leftHandIndex1' },
    { left: 101, top: 72, id: 'rightShoulder' },
    { left: 127, top: 78, id: 'rightArm' },
    { left: 137, top: 130, id: 'rightForeArm' },
    { left: 155, top: 163, id: 'rightHand' },
    { left: 113, top: 201, id: 'rightUpLeg' },
    { left: 115, top: 255, id: 'rightLeg' },
    { left: 118, top: 327, id: 'rightFoot' },
    { left: 121, top: 352, id: 'rightToeBase' },
    { left: 164, top: 181, id: 'rightHandIndex1' },
  ];

  const mappingDropdown = [
    { text: 'Source', currentOption: currentSource, setCurrentOption: setCurrentSource, option: ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'] },
    { text: 'Target', currentOption: currentTarget, setCurrentOption: setCurrentTarget, option: ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'] },
  ];

  return (
    <div className={cx('panel-wrap')}>
      <section className={cx('panel-mapping')}>
        <AnimationTitleToggle text="Mapping" spreadRef={spreadMapping} setSpreadRef={setSpreadMapping} activeStatus={isAllActive} />
        <div className={cx('container', 'mapping-icon', { active: spreadMapping })}>
          <div className={cx('body-icon-wrapper')}>
            <IconWrapper icon={SvgPath.Body} className={cx('body-icon')} />
          </div>
          <div className={cx('body-icon-wrapper')}>
            <div className={cx('joint-wrapper')}>
              {jointList.map((joint, idx) => (
                <div key={idx} id={joint.id} style={{ left: joint.left, top: joint.top }} onClick={handleJoints}>
                  <div className={cx('circle', { active: selectedJoints.includes(joint.id) })} id={joint.id}></div>
                </div>
              ))}
            </div>
          </div>
          {!isAllActive && <div className={cx('toggle-overlay')}></div>}
        </div>
        <div className={cx('container', { active: spreadMapping })}>
          {mappingDropdown.map((item, idx) => (
            <DropdownWrapper
              className={cx('mapping-dropdown')}
              key={idx}
              text={item.text}
              currentOption={item.currentOption}
              setCurrentOption={item.setCurrentOption}
              options={item.option}
              activeStatus={isAllActive}
            />
          ))}

          <AnimationRangeInput
            text="Hip space"
            step={0.01}
            currentMax={10}
            currentValue={currentHipValue}
            setCurrentValue={setCurrentHipValue}
            decimalDigit={1}
            activeStatus={isAllActive}
          />
          {!isAllActive && <div className={cx('toggle-overlay')}></div>}
        </div>
      </section>
    </div>
  );
};

export default memo(RetargetTab);
