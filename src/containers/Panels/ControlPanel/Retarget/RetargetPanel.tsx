import { FunctionComponent, useCallback, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dropdown } from 'components/New_Dropdown';
import { SuffixInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { useReactiveVar } from '@apollo/client';
import { storeRetargetData } from 'lib/store';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './RetargetPanel.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {}

export type P = BaseProps;

const RetargetPanel: FunctionComponent<P> = ({}) => {
  const retargetData = useReactiveVar(storeRetargetData);

  const [currentData, setCurrentData] = useState(retargetData);
  const [error, setError] = useState(false);

  const { register, handleSubmit } = useForm();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const boneName = [
    'hips',
    'leftUpLeg',
    'rightUpLeg',
    'spine',
    'leftLeg',
    'rightLeg',
    'spine1',
    'leftFoot',
    'rightFoog',
    'spine2',
    'leftToeBase',
    'rightToeBase',
    'neck',
    'leftShoulder',
    'rightShoulder',
    'head',
    'leftArm',
    'rightArm',
    'leftForeArm',
    'rightForeArm',
    'leftHand',
    'rightHand',
    'leftHandIndex1',
    'rightHandIndex1',
  ];

  /**
   * error, setError - true로 변경되었을 때 패널에 있는 에러 아이콘이 변경됩니다.
   */
  const claases = cx('icon', {
    error: error,
  });

  /**
   * 패널에서 Retarget Data를 초기 데이터로 되돌리는 함수입니다.
   */
  const handleRetargetRefresh = () => {
    storeRetargetData(currentData);
    alert('초기 값으로 변경되었습니다.');
  };

  /**
   * 패널에서 retargetData에 있는 targetBone 값을 변경해주는 함수입니다.
   * @param key - targetBoneList에서 할당된 key value입니다.
   */
  const handleTargetBoneSelect = useCallback(
    (key) => {
      storeRetargetData(
        _.map(retargetData, (item) => ({
          ...item,
          value: {
            ...item.value,
            targetBone: _.isEqual(item.key, boneName) ? key : item.value.targetBone,
          },
        })),
      );
    },
    [boneName, retargetData],
  );

  /**
   * 패널에서 XYZ~YXZ까지 좌표를 선택하는 것에 대한 값을 변경해주는 함수입니다.
   * @param key - coordList에서 할당된 key value입니다.
   */
  const handleCoordSelect = useCallback(
    (key) => {
      // storeRetargetData(
      //   _.map(retargetData, (item) => ({
      //     ...item,
      //     value: {
      //       ...item.value,
      //       order: _.isEqual(item.key, boneName) ? key : item.value.order,
      //     },
      //   })),
      // );
    },
    [],
    // [boneName, retargetData],
  );

  /**
   * 패널에 있는 X, Y, Z 인풋에서 값을 변경하는 함수입니다.
   * @param value
   * @param name
   * @param key
   */
  const handleChange = useCallback(
    ({ value, name, key }) => {
      storeRetargetData(
        _.map(retargetData, (item) => ({
          ...item,
          value: {
            ...item.value,
            [name]: _.isEqual(item.key, key) ? parseFloat(value) : (item as any)[name],
          },
        })),
      );
    },
    [retargetData],
  );

  /**
   * 24개 인풋이 모두 채워졌을 때 retargetData 값을 submit하는 함수입니다.
   */
  const handleSubmitData = () => {
    storeRetargetData(retargetData);
  };

  const coordList = [
    {
      key: 'xyz',
      value: 'XYZ',
      isSelected: true,
    },
    {
      key: 'xzy',
      value: 'XZY',
      isSelected: false,
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

  useEffect(() => {
    storeRetargetData(retargetData);
    console.log(retargetData);
  }, [retargetData]);

  return (
    <main className={cx('panel-wrap')}>
      <form onSubmit={handleSubmit(handleSubmitData)}>
        <section className={cx('section-setup')}>
          <ul className={cx('setup-group')}>
            <IconWrapper
              className={cx('icon')}
              icon={SvgPath.Refresh}
              onClick={handleRetargetRefresh}
              hasFrame={false}
            />
            <IconWrapper className={claases} icon={SvgPath.Error} hasFrame={false} />
          </ul>
          <ul className={cx('setup-group')}>
            <button type="submit" className={cx('apply-button', 'right')}>
              Apply
            </button>
          </ul>
        </section>
        <section className={cx('section-retarget')}>
          {_.map(retargetData, (item, idx) => {
            const targetBoneList = _.fill(
              [
                {
                  key: 'default',
                  value: 'TargetBone',
                  isSelected: true,
                },
              ],
              {
                key: item.value.targetBone,
                value: item.value.targetBone,
                isSelected: false,
              },
            );
            return (
              <div key={idx} className={cx('retarget-card')}>
                <div className={cx('card-header')}>
                  <span>{item.key}</span>
                  <Dropdown list={targetBoneList} onSelect={handleTargetBoneSelect} />
                </div>
                <div className={cx('card-coord')}>
                  <Dropdown list={coordList} onSelect={handleCoordSelect} />
                  <div className={cx('card-input-group')}>
                    <SuffixInput
                      name="x"
                      suffix="°"
                      defaultValue={item.value.x}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'x', value: e.target.value })
                      }
                      innerRef={register}
                    />
                    <SuffixInput
                      name="y"
                      suffix="°"
                      defaultValue={item.value.y}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'y', value: e.target.value })
                      }
                      innerRef={register}
                    />
                    <SuffixInput
                      name="z"
                      suffix="°"
                      defaultValue={item.value.z}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'z', value: e.target.value })
                      }
                      innerRef={register}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </form>
    </main>
  );
};

export default RetargetPanel;
