import { FunctionComponent, useCallback, useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Dropdown } from 'components/Dropdown';
import { SuffixInput } from 'components/Input';
import { IconWrapper, SvgPath } from 'components/Icon';
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
      if (isSubmitted) {
        setIsSubmitted(false);
      }
    },
    [isSubmitted, retargetMap],
  );

  /**
   * 패널에서 XYZ~YXZ까지 좌표를 선택하는 것에 대한 값을 변경해주는 함수입니다.
   * @param key - coordList에서 할당된 key value입니다.
   */
  const handleCoordSelect = useCallback(
    (key, value) => {
      storeRetargetMap(
        _.map(retargetMap, (item) => ({
          ...item,
          value: {
            ...item.value,
            order: _.isEqual(item.key, key) ? value : item.value.order,
          },
        })),
      );
      setIsSubmitted(false);
    },
    [retargetMap],
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
            [name]: _.isEqual(item.key, key) ? parseFloat(value) : (item.value as any)[name],
          },
        })),
      );
      setIsSubmitted(false);
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

  const initialCoordList = [
    {
      key: 'xyz',
      value: 'xyz',
      isSelected: true,
    },
    {
      key: 'xzy',
      value: 'xzy',
      isSelected: false,
    },
    {
      key: 'yzx',
      value: 'yzx',
      isSelected: false,
    },
    {
      key: 'zxy',
      value: 'zxy',
      isSelected: false,
    },
    {
      key: 'zyx',
      value: 'zyx',
      isSelected: false,
    },
    {
      key: 'yxz',
      value: 'yxz',
      isSelected: false,
    },
  ];

  useEffect(() => {
    setIsSubmitted(false);
  }, []);

  return (
    <div className={cx('panel-wrap')}>
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
              isSelected: _.isEqual(item?.value?.targetBone, targetbone?.value),
            }));
            const coordList = _.map(initialCoordList, (coord) => ({
              ...coord,
              key: item?.key,
              isSelected: _.isEqual(coord.value, item?.value?.order),
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
                      value={item.value.x}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'x', value: e.target.value })
                      }
                      innerRef={register}
                    />
                    <SuffixInput
                      name="y"
                      suffix="°"
                      defaultValue={item.value.y}
                      value={item.value.y}
                      onChange={(e) =>
                        handleChange({ key: item.key, name: 'y', value: e.target.value })
                      }
                      innerRef={register}
                    />
                    <SuffixInput
                      name="z"
                      suffix="°"
                      defaultValue={item.value.z}
                      value={item.value.z}
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
    </div>
  );
};

export default RetargetPanel;
