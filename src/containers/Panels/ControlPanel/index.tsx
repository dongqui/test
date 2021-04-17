import { FunctionComponent, useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { Tabs, Tab } from 'components/New_Tabs';
import { PropertyPanel } from './Property';
import { RetargetPanel } from './Retarget';
import { storeCurrentVisualizedData } from 'lib/store';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export const ControlPanel: FunctionComponent<{}> = () => {
  const [noModel, setNoModel] = useState(true);
  const visualization = useReactiveVar(storeCurrentVisualizedData);
  useEffect(() => {
    if (visualization) {
      setNoModel(false);
    } else {
      setNoModel(true);
    }
  }, [visualization]);
  return (
    <main className={cx('panel-wrap')}>
      <Tabs>
        <Tab title="Property">
          <PropertyPanel />
        </Tab>
        <Tab title="Retarget" disabled={noModel}>
          <RetargetPanel />
        </Tab>
      </Tabs>
    </main>
  );
};
