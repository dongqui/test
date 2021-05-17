import { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import _ from 'lodash';
import { Tabs, Tab } from 'components/Tabs';
import { PropertyPanel } from './Property';
import { RetargetPanel } from './Retarget';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { useReactiveVar } from '@apollo/client';
import { storeRetargetInfo } from 'lib/store';

const cx = classNames.bind(styles);

export const ControlPanel: FunctionComponent<{}> = () => {
  const retargetInfo = useReactiveVar(storeRetargetInfo);
  const isDisabled = _.isEmpty(retargetInfo?.targetboneList);

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  return (
    <main className={cx('panel-wrap')} onContextMenu={handleContextMenu}>
      <Tabs>
        <Tab title="Property">
          <PropertyPanel />
        </Tab>
        <Tab title="Retarget" disabled={isDisabled}>
          <RetargetPanel />
        </Tab>
      </Tabs>
    </main>
  );
};
