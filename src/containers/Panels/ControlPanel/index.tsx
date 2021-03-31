import { FunctionComponent } from 'react';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

// 패널에 있는 텍스트는 아코디언 컴포넌트 개발 후 수정 예정
export const ControlPanel: FunctionComponent<{}> = () => {
  return (
    <main className={cx('panel-wrap')}>
      <section className={cx('panel-top-header')}>
        <span>Properties</span>
      </section>
      <section className={cx('panel-transform')}>
        <span>Transform</span>
      </section>
      <section className={cx('panel-camera')}>
        <span>Camera</span>
      </section>
      <section className={cx('panel-visibility')}>
        <span>Visibility</span>
      </section>
      <section className={cx('panel-fog')}>
        <span>Fog</span>
      </section>
    </main>
  );
};
