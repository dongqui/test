import { FunctionComponent, Dispatch, SetStateAction } from 'react';
import { Dropdown } from 'components/ControlPanel';
import classNames from 'classnames/bind';
import styles from './DropdownWrapper.module.scss';

const cx = classNames.bind(styles);

interface Props {
  className?: string;
  title: string;
  currentValue?: string;
  options: Array<{ text: string; handleSelect: Dispatch<SetStateAction<string>> }>;
  activeStatus?: boolean;
  inactiveMessage?: string;
}

const DropdownWrapper: FunctionComponent<Props> = ({ className, title, options, activeStatus, inactiveMessage, currentValue }) => {
  const classes = cx('wrapper', className, { able: activeStatus === undefined ? true : activeStatus });

  return (
    <div className={cx(classes)}>
      <p>{title}</p>
      <Dropdown options={options} currentValue={currentValue} activeStatus={activeStatus} inactiveMessage={inactiveMessage} />
    </div>
  );
};

export default DropdownWrapper;
