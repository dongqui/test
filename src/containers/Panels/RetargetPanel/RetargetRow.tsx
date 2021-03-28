import { useReactiveVar } from '@apollo/client';
import { storeRetargetData } from 'lib/store';
import _ from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { RetargetDataPropertyName } from '../../../types/RP';
import { Dropdown } from './Dropdown';
import * as S from './RetargetPanelStyles';

export interface RetargetRowProps {
  boneName: string;
  index: number;
  targetBones: string[];
}

const RetargetRowComponent: React.FC<RetargetRowProps> = ({
  boneName = 'Head',
  index,
  targetBones = ['Source Bone1', 'Source Bone2', 'Source Bone3', 'Source Bone4', 'Source Bone5'],
}) => {
  const retargetData = useReactiveVar(storeRetargetData);
  const x = useMemo(() => _.find(retargetData, [RetargetDataPropertyName.boneName, boneName])?.x, [
    boneName,
    retargetData,
  ]);
  const y = useMemo(() => _.find(retargetData, [RetargetDataPropertyName.boneName, boneName])?.y, [
    boneName,
    retargetData,
  ]);
  const z = useMemo(() => _.find(retargetData, [RetargetDataPropertyName.boneName, boneName])?.z, [
    boneName,
    retargetData,
  ]);
  const targetBoneName = useMemo(
    () => _.find(retargetData, [RetargetDataPropertyName.boneName, boneName])?.targetBoneName,
    [boneName, retargetData],
  );
  const targetBoneData = useMemo(() => {
    const result = _.map(targetBones, (item, index) => ({
      key: item,
      name: item,
      isSelected: _.isEqual(item, targetBoneName),
    }));
    if (_.isEmpty(targetBoneName)) {
      result[0].isSelected = true;
    }
    return result;
  }, [targetBoneName, targetBones]);
  const handleChange = useCallback(
    ({ value, name, boneName }) => {
      if (!_.isNaN(Number(value)) && !_.isEmpty(value)) {
        storeRetargetData(
          _.map(retargetData, (item) => ({
            ...item,
            [name]: _.isEqual(item.boneName, boneName) ? parseFloat(value) : (item as any)[name],
          })),
        );
      }
    },
    [retargetData],
  );
  const handleSelect = useCallback(
    ({ key }) => {
      storeRetargetData(
        _.map(retargetData, (item) => ({
          ...item,
          targetBoneName: _.isEqual(item.boneName, boneName) ? key : item.targetBoneName,
        })),
      );
    },
    [boneName, retargetData],
  );
  return (
    <S.RetargetRowWrapper>
      <S.RetargetRowParentWrapper>
        <S.RetargetRowChildWrapper>
          {boneName}
          <S.RetargetRowDropDownWrapper zIndex={100 - index}>
            <Dropdown data={targetBoneData} onSelect={handleSelect} />
          </S.RetargetRowDropDownWrapper>
        </S.RetargetRowChildWrapper>
        <S.RetargetRowChildWrapper>
          <S.IndicatorWrapper>
            X
            <S.IndicatorNumberWrapper>
              <div>X</div>
              <S.IndicatorMiddleBar></S.IndicatorMiddleBar>
              <S.RetargetRowInput
                value={x}
                name={RetargetDataPropertyName.x}
                onChange={(e) => handleChange({ boneName, name: 'x', value: e.target.value })}
              ></S.RetargetRowInput>
            </S.IndicatorNumberWrapper>
          </S.IndicatorWrapper>
          <S.IndicatorWrapper>
            Y
            <S.IndicatorNumberWrapper>
              <div>Y</div>
              <S.IndicatorMiddleBar></S.IndicatorMiddleBar>
              <S.RetargetRowInput
                value={y}
                name={RetargetDataPropertyName.y}
                onChange={(e) => handleChange({ boneName, name: 'y', value: e.target.value })}
              ></S.RetargetRowInput>
            </S.IndicatorNumberWrapper>
          </S.IndicatorWrapper>
          <S.IndicatorWrapper>
            Z
            <S.IndicatorNumberWrapper>
              <div>Z</div>
              <S.IndicatorMiddleBar></S.IndicatorMiddleBar>
              <S.RetargetRowInput
                value={z}
                name={RetargetDataPropertyName.z}
                onChange={(e) => handleChange({ boneName, name: 'z', value: e.target.value })}
              ></S.RetargetRowInput>
            </S.IndicatorNumberWrapper>
          </S.IndicatorWrapper>
        </S.RetargetRowChildWrapper>
      </S.RetargetRowParentWrapper>
    </S.RetargetRowWrapper>
  );
};
export const RetargetRow = React.memo(RetargetRowComponent);
