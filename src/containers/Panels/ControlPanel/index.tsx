import { FunctionComponent } from 'react';
import { Tabs, Tab } from 'components/New_Tabs';
import { PropertyPanel } from './Property';
import { RetargetPanel } from './Retarget';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export const ControlPanel: FunctionComponent<{}> = () => {
  return (
    <main className={cx('panel-wrap')}>
      <Tabs>
        <Tab title="Property">
          <PropertyPanel />
        </Tab>
        <Tab title="Retarget" disabled={false}>
          <RetargetPanel />
        </Tab>
      </Tabs>
    </main>
  );
};
