import { FunctionComponent, Dispatch, SetStateAction, Children } from 'react';
import { Dropdown } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './DropdownWrapper.module.scss';
import { IconWrapper, SvgPath } from 'components/Icon';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  title: string;
  currentValue?: string;
  options: Array<{ text: string; handleSelect: Dispatch<SetStateAction<string>> }>;
  activeStatus?: boolean;
  inactiveMessage?: string;
}

const DropdownWrapper: FunctionComponent<React.PropsWithChildren<Props>> = ({ className, title, options, activeStatus, inactiveMessage, currentValue }) => {
  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{title}</p>
      {/*리팩토링 이후에 select/option 코드 제거.*/}
      <div className={cx('dropdown-button')}>
        <div className={cx('dropdown-text')}>{currentValue ?? 'Select Option'}</div>
        <IconWrapper className={cx('arrow-down-icon')} icon={SvgPath.EmptyDownArrow} />
        <select
          onChange={(e) => {
            const selectedOption = options[e.currentTarget.selectedIndex];
            if (selectedOption) {
              selectedOption.handleSelect(selectedOption.text);
            }
          }}
          className={cx('select')}
          value={currentValue ?? 'Select Option'}
        >
          {Children.toArray(options.map((v, i) => <option key={`${i}.${v.text}`}>{v.text}</option>))}
        </select>
      </div>
      {/*Dropdown 버그를 수정하기 위해서 임시로 주석 처리.*/}
      {/*<Dropdown options={options} currentValue={currentValue} activeStatus={activeStatus} inactiveMessage={inactiveMessage} />*/}
    </div>
  );
};

export default DropdownWrapper;
