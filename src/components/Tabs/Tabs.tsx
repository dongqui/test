import { FunctionComponent, ReactElement } from 'react';
import TabTitle from './TabTitle';
import { useSelector } from 'reducers';
import classNames from 'classnames/bind';
import styles from './Tabs.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children: ReactElement[];
}

const Tabs: FunctionComponent<Props> = ({ children }) => {
  const { tabIndex } = useSelector((state) => state.cpData);

  return (
    <>
      <div className={cx('tabs-wrap')}>
        {children.map((item, idx) => (
          <TabTitle key={idx} tabID={idx} title={item.props.title} disabled={item.props.disabled} />
        ))}
      </div>
      <div>{children[tabIndex]}</div>
    </>
  );
};

export default Tabs;
