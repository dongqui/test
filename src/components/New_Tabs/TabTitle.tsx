import { FunctionComponent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabTitle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  tabID: number;
  title: string;
  activeTab: number;
  setAtiveTab: (index: number) => void;
}

const TabTitle: FunctionComponent<Props> = ({ tabID, title, activeTab, setAtiveTab }) => {
  const handleClick = useCallback(() => {
    setAtiveTab(tabID);
  }, [setAtiveTab, tabID]);
  return (
    <div className={cx('tab-header', activeTab === tabID ? cx('active') : undefined)}>
      <button className={cx('tab-btn')} onClick={handleClick}>
        <span>{title}</span>
      </button>
    </div>
  );
};

export default TabTitle;
