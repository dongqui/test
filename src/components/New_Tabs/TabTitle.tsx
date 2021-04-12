import { FunctionComponent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabTitle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  tabID: number;
  title: string;
  disabled: boolean;
  activeTab: number;
  setAtiveTab: (index: number) => void;
}

const TabTitle: FunctionComponent<Props> = ({ tabID, title, disabled, activeTab, setAtiveTab }) => {
  const handleClick = useCallback(() => {
    setAtiveTab(tabID);
  }, [setAtiveTab, tabID]);
  const classes = cx('tab-header', activeTab === tabID ? cx('active') : undefined, {
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
