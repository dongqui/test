import { FunctionComponent, useState, Dispatch, SetStateAction } from 'react';
import { Dropdown } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './DropdownWrapper.module.scss';

interface Props {
  className?: string;
  text: string;
  currentOption: string;
  setCurrentOption: Dispatch<SetStateAction<string>>;
  options: string[];
  activeStatus?: boolean;
}

const cx = classNames.bind(styles);

const DropdownWrapper: FunctionComponent<Props> = ({ className, text, options, activeStatus, currentOption, setCurrentOption }) => {
  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{text}</p>
      <Dropdown options={options} currentOption={currentOption} setCurrentOption={setCurrentOption} activeStatus={activeStatus} />
    </div>
  );
};

export default DropdownWrapper;
