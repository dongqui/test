import { FunctionComponent, Dispatch, SetStateAction } from 'react';
import { Dropdown } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './DropdownWrapper.module.scss';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  text: string;
  currentValue?: string;
  options: Array<{ text: string; handleSelect: Dispatch<SetStateAction<string>> }>;
  activeStatus?: boolean;
}

const DropdownWrapper: FunctionComponent<Props> = ({ className, text, options, activeStatus, currentValue }) => {
  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{text}</p>
      <Dropdown options={options} currentValue={currentValue} activeStatus={activeStatus} />
    </div>
  );
};

export default DropdownWrapper;
