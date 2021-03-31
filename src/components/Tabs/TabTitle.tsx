import { FunctionComponent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './TabTitle.module.scss';

const cx = classNames.bind(styles);

interface Props {
  tabID: number;
  title: string;
  setAtiveTab: (index: number) => void;
}

const TabTitle: FunctionComponent<Props> = ({ tabID, title, setAtiveTab }) => {
  const handleClick = useCallback(() => {
    setAtiveTab(tabID);
  }, [setAtiveTab, tabID]);
  return (
    <div className={cx('tab-header')}>
      <button onClick={handleClick}>{title}</button>
    </div>
  );
};

export default TabTitle;
