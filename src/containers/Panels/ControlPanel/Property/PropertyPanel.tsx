import { FunctionComponent } from 'react';
import { Segment } from 'components/New_Segment';
import { PrefixInput } from 'components/New_Input';
import { AccordionMenu } from 'components/New_AccordionMenu';
import classNames from 'classnames/bind';
import styles from './PropertyPanel.module.scss';

const cx = classNames.bind(styles);

const PropertyPanel: FunctionComponent<{}> = () => {
  const objList = [
    { id: 1, contents: 'ON' },
    { id: 2, contents: 'OFF' },
  ];
  return (
    <main className={cx('panel-wrap')}>
      <section className={cx('panel-transform')}>
        <AccordionMenu title="Transform">
          <div className={cx('transform-inner')}>
            <span className={cx('property-title')}>Position</span>
            <div className={cx('transform-group')}>
              <PrefixInput prefix="X" />
              <PrefixInput prefix="Y" />
              <PrefixInput prefix="Z" />
            </div>
          </div>
          <div className={cx('transform-inner')}>
            <span className={cx('property-title')}>Rotation</span>
            <div className={cx('transform-group')}>
              <PrefixInput prefix="X" />
              <PrefixInput prefix="Y" />
              <PrefixInput prefix="Z" />
            </div>
          </div>
          <div className={cx('transform-inner')}>
            <span className={cx('property-title')}>Scale</span>
            <div className={cx('transform-group')}>
              <PrefixInput prefix="X" />
              <PrefixInput prefix="Y" />
              <PrefixInput prefix="Z" />
            </div>
          </div>
        </AccordionMenu>
      </section>
      <section className={cx('panel-visibility')}>
        <AccordionMenu title="Visibility">
          <div className={cx('segment-group')}>
            <span>Axis</span>
            <Segment objList={objList} />
          </div>
          <div className={cx('segment-group')}>
            <span>Bone</span>
            <Segment objList={objList} />
          </div>
          <div className={cx('segment-group')}>
            <span>Mesh</span>
            <Segment objList={objList} />
          </div>
          <div className={cx('segment-group')}>
            <span>Shadow</span>
            <Segment objList={objList} />
          </div>
        </AccordionMenu>
      </section>
    </main>
  );
};

export default PropertyPanel;
