import { FunctionComponent, useState, ReactElement } from 'react';
import TabTitle from './TabTitle';
import classNames from 'classnames/bind';
import styles from './Tabs.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: ReactElement[];
}

const Tabs: FunctionComponent<Props> = ({ children }) => {
  const [activeTab, setAtiveTab] = useState(0);
  return (
    <>
      <div className={cx('tabs-wrap')}>
        {children.map((item, idx) => (
          <TabTitle
            key={idx}
            tabID={idx}
            title={item.props.title}
            disabled={item.props.disabled}
            activeTab={activeTab}
            setAtiveTab={setAtiveTab}
          />
        ))}
      </div>
      <div>{children[activeTab]}</div>
    </>
  );
};

export default Tabs;
