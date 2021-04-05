import { useReactiveVar } from '@apollo/client';
import { LayerIcon } from 'components/Icons/generated2/LayerIcon';
import { storeSkeletonHelper } from 'lib/store';
import _ from 'lodash';
import React, { memo } from 'react';
import { fnGetNewLayer } from 'utils/TP/editingUtils';
import * as S from './PlayBarStyles';

const LayerSelect: React.FC = () => {
  const skeletonHelper = useReactiveVar(storeSkeletonHelper);

  const handleClick = () => {
    const ok = confirm('Add a new layer?');
    if (ok && skeletonHelper) {
      const newLayer = fnGetNewLayer({ name: 'new layer', bones: skeletonHelper.bones });
      console.log('new layer: ', newLayer);
    }
  };

  return (
    <S.ModeSelectWrapper>
      <S.ModeSelectIconWrapper onClick={handleClick}>
        <LayerIcon />
      </S.ModeSelectIconWrapper>
    </S.ModeSelectWrapper>
  );
};
export default memo(LayerSelect);
