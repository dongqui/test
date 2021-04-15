/* eslint-disable react-hooks/exhaustive-deps */
import { FunctionComponent, useCallback } from 'react';
import { Dropdown } from 'components/New_Dropdown';
import { SuffixInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { retargetMap } from 'utils/retargetMap';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './RetargetPanel.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  // error: boolean;
}

export type P = BaseProps;

const RetargetPanel: FunctionComponent<P> = ({}) => {
  const fasterList = [
    {
      key: 'Default',
      value: 'Target Bone',
      isSelected: true,
    },
  ];
  const coordList = [
    {
      key: 'xyz',
      value: 'XYZ',
      isSelected: true,
    },
    {
      key: 'xzy',
      value: 'XZY',
      isSelected: true,
    },
    {
      key: 'yzx',
      value: 'YZX',
      isSelected: false,
    },
    {
      key: 'zxy',
      value: 'ZXY',
      isSelected: false,
    },
    {
      key: 'zyx',
      value: 'ZYX',
      isSelected: false,
    },
    {
      key: 'yzx',
      value: 'YZX',
      isSelected: false,
    },
    {
      key: 'yxz',
      value: 'YXZ',
      isSelected: false,
    },
  ];

  const handleTargetBoneSelect = useCallback((key, value) => {
    // console.log(fasterList);
    _.map(retargetMap, (item: any, idx) => {
      item.value.order = key;
      fasterList.push({
        key: item.value.sourceBone[1],
        value: item.value.sourceBone[1],
        isSelected: true,
      });
      // console.log('update', fasterList);
      // console.log(item.value.sourceBone);
    });
  }, []);

  const handleRetargetRefresh = () => {
    alert('Refresh');
  };

  return (
    <main className={cx('panel-wrap')}>
      <section className={cx('section-setup')}>
        <ul className={cx('setup-group')}>
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Refresh}
            onClick={handleRetargetRefresh}
            hasFrame={false}
          />
          <IconWrapper
            className={cx('icon')}
            icon={SvgPath.Error}
            onClick={() => {}}
            hasFrame={false}
          />
        </ul>
      </section>
      <section className={cx('section-retarget')}>
        {_.map(retargetMap, (item: any, idx) => (
          <div className={cx('retarget-card')}>
            <div className={cx('card-header')}>
              <span>{item.key}</span>
              <Dropdown list={fasterList} onSelect={handleTargetBoneSelect} />
            </div>
            <div className={cx('card-coord')}>
              <Dropdown list={coordList} onSelect={handleTargetBoneSelect} />
              <div className={cx('card-input-group')}>
                <SuffixInput suffix="°" value={item.value.x} />
                <SuffixInput suffix="°" value={item.value.y} />
                <SuffixInput suffix="°" value={item.value.z} />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
};

// °

export default RetargetPanel;
