import { FunctionComponent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabTitle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  tabID: number;
  title: string;
  disabled: boolean;
}

const TabTitle: FunctionComponent<Props> = ({ tabID, title, disabled }) => {
  const classes = cx('tab-header');

  const handleClick = useCallback(() => {}, []);

  return (
    <div className={classes}>
      <button className={cx('tab-btn')} disabled={disabled} onClick={handleClick}>
        <span>{title}</span>
      </button>
    </div>
  );
};

export default TabTitle;
