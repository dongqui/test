import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animationDataActions from 'actions/animationDataAction';

const InsertKeyframe = () => {
  const dispatch = useDispatch();
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  const handleClickButton = useCallback(() => {
    if (_visualizedAssetIds.length !== 0) {
      dispatch(animationDataActions.editKeyframes());
    }
  }, [_visualizedAssetIds.length, dispatch]);

  return <IconWrapper icon={SvgPath.InsertKeyframe} hasFrame={false} onClick={handleClickButton} />;
};

export default InsertKeyframe;
