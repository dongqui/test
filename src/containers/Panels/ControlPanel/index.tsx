import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import { Tabs, Tab } from 'components/Tabs';
import PropertyTab from './PropertyTab';
import RetargetTab from './RetargetTab';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ControlPanel: FunctionComponent = () => {
  return (
    <div className={cx('wrapper')}>
      <Tabs>
        <Tab title="Property">
          <PropertyTab />
        </Tab>
        <Tab title="Retarget">
          <RetargetTab />
        </Tab>
      </Tabs>
    </div>
  );
};

export default memo(ControlPanel);
