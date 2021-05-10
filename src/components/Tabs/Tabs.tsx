import { FunctionComponent, useState, ReactElement } from 'react';
import { useReactiveVar } from '@apollo/client';
import { storeCPChangeTab } from 'lib/store';
import TabTitle from './TabTitle';
import classNames from 'classnames/bind';
import styles from './Tabs.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: ReactElement[];
}

const Tabs: FunctionComponent<Props> = ({ children }) => {
  const changeTabs = useReactiveVar(storeCPChangeTab);
  return (
    <>
      <div className={cx('tabs-wrap')}>
        {children.map((item, idx) => (
          <TabTitle key={idx} tabID={idx} title={item.props.title} disabled={item.props.disabled} />
        ))}
      </div>
      <div>{children[changeTabs]}</div>
    </>
  );
};

export default Tabs;
