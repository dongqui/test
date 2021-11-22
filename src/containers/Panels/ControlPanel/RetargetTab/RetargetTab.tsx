import { FunctionComponent, useState, memo } from 'react';
import { AnimationRangeInput, AnimationTitleToggle } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './RetargetTab.module.scss';
import DropdownWrapper from 'components/ControlPanel/DropdownWrapper';
import { IconWrapper, SvgPath } from 'components/Icon';

const cx = classNames.bind(styles);

const RetargetTab: FunctionComponent = () => {
  const [spreadMapping, setSpreadMapping] = useState<boolean>(true);
  const [currentSource, setCurrentSource] = useState<string>('Option1');
  const [currentTarget, setCurrentTarget] = useState<string>('Option2');
  const [currentHipValue, setCurrentHipValue] = useState<number>(0);

  const mappingDropdown = [
    { text: 'Source', currentOption: currentSource, setCurrentOption: setCurrentSource, option: ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'] },
    { text: 'Target', currentOption: currentTarget, setCurrentOption: setCurrentTarget, option: ['Option1', 'Option2', 'Option3', 'Option4', 'Option5'] },
  ];

  return (
    <div className={cx('panel-wrap')}>
      <section className={cx('panel-mapping')}>
        <AnimationTitleToggle text="Mapping" spreadRef={spreadMapping} setSpreadRef={setSpreadMapping} />
        <div className={cx('container', 'mapping-icon', { active: spreadMapping })}>
          <div className={cx('body-icon-wrapper')}>
            <IconWrapper icon={SvgPath.Body} className={cx('body-icon')} />
          </div>
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
            />
          ))}

          <AnimationRangeInput text="Hip space" step={0.01} currentMax={10} currentValue={currentHipValue} setCurrentValue={setCurrentHipValue} decimalDigit={1} />
        </div>
      </section>
    </div>
  );
};

export default memo(RetargetTab);
