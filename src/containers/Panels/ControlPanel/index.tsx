import { FunctionComponent } from 'react';
import { Tabs, Tab } from 'components/Tabs';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

export const ControlPanel: FunctionComponent<{}> = () => {
  return (
    <main className={cx('panel-wrap')}>
      <Tabs>
        <Tab title="Properties">
          <section className={cx('panel-transform')}>
            <span>Transform</span>
          </section>
          <section className={cx('panel-visibility')}>
            <span>Visibility</span>
          </section>
        </Tab>
        <Tab title="Retargeting">Retargeting</Tab>
      </Tabs>
    </main>
  );
};
