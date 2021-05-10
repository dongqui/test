import { FunctionComponent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabTitle.module.scss';
import { storeCPChangeTab } from 'lib/store';
import { useReactiveVar } from '@apollo/client';

const cx = classNames.bind(styles);

interface Props {
  tabID: number;
  title: string;
  disabled: boolean;
}

const TabTitle: FunctionComponent<Props> = ({ tabID, title, disabled }) => {
  const changeTabs = useReactiveVar(storeCPChangeTab);
  const handleClick = useCallback(() => {
    storeCPChangeTab(tabID);
  }, [tabID]);
  const classes = cx('tab-header', changeTabs === tabID ? cx('active') : undefined, {
    disabled,
  });
  return (
    <div className={classes}>
      <button className={cx('tab-btn')} disabled={disabled} onClick={handleClick}>
        <span>{title}</span>
      </button>
    </div>
  );
};

export default TabTitle;
