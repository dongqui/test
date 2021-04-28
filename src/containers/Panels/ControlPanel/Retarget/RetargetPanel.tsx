import { FunctionComponent, useCallback, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Dropdown } from 'components/New_Dropdown';
import { SuffixInput } from 'components/New_Input';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { useReactiveVar } from '@apollo/client';
import { storeCPChangeTab, storeRetargetInfo, storeRetargetMap } from 'lib/store';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './RetargetPanel.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {}

export type P = BaseProps;

export const defaultTargetboneValue = 'select a bone';
const RetargetPanel: FunctionComponent<P> = ({}) => {
  const retargetMap = useReactiveVar(storeRetargetMap);
  const retargetInfo = useReactiveVar(storeRetargetInfo);
  const [currentData, setCurrentData] = useState(retargetMap);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const error = useMemo(() => _.some(retargetMap, (item) => _.isEmpty(item?.value?.targetBone)), [
    retargetMap,
  ]);

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
   * error가 없을때, submit을 했을때 apply 버튼의 색깔이 변경됩니다
   */
  const applyButtonClasses = cx('apply-button', 'right', {
    ready: !error,
    submit: isSubmitted,
  });

  /**
   * 패널에서 Retarget Data를 초기 데이터로 되돌리는 함수입니다.
   */
  const handleRetargetRefresh = () => {
    storeRetargetMap(currentData);
  };

  /**
   * 패널에서 retargetData에 있는 targetBone 값을 변경해주는 함수입니다.
   * @param key - targetBoneList에서 할당된 key value입니다.
   */
  const handleTargetBoneSelect = useCallback(
    (key, value) => {
      let newValue = _.clone(value);
      if (_.isEqual(newValue, defaultTargetboneValue)) {
        newValue = '';
      }
      storeRetargetMap(
        _.map(retargetMap, (item) => ({
          ...item,
          value: {
            ...item.value,
            targetBone: _.isEqual(item.key, key) ? newValue : item.value.targetBone,
          },
        })),
      );
    },
    [retargetMap],
  );

  /**
   * 패널에서 XYZ~YXZ까지 좌표를 선택하는 것에 대한 값을 변경해주는 함수입니다.
   * @param key - coordList에서 할당된 key value입니다.
   */
  const handleCoordSelect = useCallback(
    (key) => {
      // storeRetargetMap(
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
      storeRetargetMap(
        _.map(retargetMap, (item) => ({
          ...item,
          value: {
            ...item.value,
            [name]: _.isEqual(item.key, key) ? parseFloat(value) : (item as any)[name],
          },
        })),
      );
    },
    [retargetMap],
  );

  /**
   * 24개 인풋이 모두 채워졌을 때 retargetData 값을 submit하는 함수입니다.
   */
  const handleSubmitData = () => {
    if (!_.isEmpty(retargetMap)) {
      storeRetargetInfo({ ...retargetInfo, retargetMap });
      setIsSubmitted(true);
    }
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
    setIsSubmitted(false);
  }, []);

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
            <button type="submit" className={applyButtonClasses} disabled={error}>
              Apply
            </button>
          </ul>
        </section>
        <section className={cx('section-retarget')}>
          {_.map(retargetMap, (item, idx) => {
            const targetboneList = _.map(retargetInfo?.targetboneList, (targetbone) => ({
              ...targetbone,
              key: item?.key,
            }));
            return (
              <div key={idx} className={cx('retarget-card')}>
                <div className={cx('card-header')}>
                  <span>{item.key}</span>
                  <Dropdown list={targetboneList} onSelect={handleTargetBoneSelect} />
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
                      disabled
                    />
                    <SuffixInput
                      name="y"
                      suffix="°"
                      defaultValue={item.value.y}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'y', value: e.target.value })
                      }
                      innerRef={register}
                      disabled
                    />
                    <SuffixInput
                      name="z"
                      suffix="°"
                      defaultValue={item.value.z}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'z', value: e.target.value })
                      }
                      innerRef={register}
                      disabled
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
