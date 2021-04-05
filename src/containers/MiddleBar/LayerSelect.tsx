import { useReactiveVar } from '@apollo/client';
import { LayerIcon } from 'components/Icons/generated2/LayerIcon';
import produce from 'immer';
import { storeCurrentVisualizedData, storeSkeletonHelper } from 'lib/store';
import _ from 'lodash';
import React, { memo } from 'react';
import { CurrentVisualizedDataType } from 'types';
import fnGetSmallestNewNumber from 'utils/common/fnGetSmallestNewNumber';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import * as S from './PlayBarStyles';

const LayerSelect: React.FC = () => {
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);
  const currentVisualizedData = useReactiveVar(storeCurrentVisualizedData);

  const handleClickNewLayer = () => {
    const isConfirmed = confirm('Add a new layer?');

    if (isConfirmed && skeletonHelper && currentVisualizedData) {
      const defaultNameRegex = /^layer[0-9]+/;
      const defaultTypeNames = currentVisualizedData.layers
        .map((layer) => layer.name.match(defaultNameRegex))
        .filter((res) => !_.isNull(res));
      const defaultTypeOrders = defaultTypeNames.map((item) =>
        parseInt(item ? item[0].split('layer')[1] : '1'),
      );
      const nextOrder = fnGetSmallestNewNumber(defaultTypeOrders);
      const newLayer = fnGetNewLayer({ name: `layer${nextOrder}`, bones: skeletonHelper.bones });
      const state = storeCurrentVisualizedData();
      if (state) {
        const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
          draft?.layers.push(newLayer);
        });
        storeCurrentVisualizedData(nextState);
      }
    }
  };

  const handleClickDeleteLayer = ({ key }: { key: string }) => {
    const isConfirmed = confirm('Delete this layer?');

    if (isConfirmed && currentVisualizedData) {
      const targetLayerIndex = _.findIndex(
        currentVisualizedData.layers,
        (layer) => layer.key === key,
      );
      if (targetLayerIndex !== -1) {
        const state = storeCurrentVisualizedData();
        if (state) {
          const nextState = produce<CurrentVisualizedDataType>(state, (draft) => {
            draft?.layers === draft.layers.splice(targetLayerIndex, 1);
          });
          storeCurrentVisualizedData(nextState);
        }
      }
    }
  };

  return (
    <S.ModeSelectWrapper>
      <S.ModeSelectIconWrapper onClick={handleClickNewLayer}>
        <LayerIcon />
      </S.ModeSelectIconWrapper>
    </S.ModeSelectWrapper>
  );
};
export default memo(LayerSelect);
