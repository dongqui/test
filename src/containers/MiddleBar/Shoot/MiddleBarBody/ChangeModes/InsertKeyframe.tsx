import React, { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as animationDataActions from 'actions/animationDataAction';

const InsertKeyframe = () => {
  const dispatch = useDispatch();

  const handleClickButton = useCallback(() => {
    dispatch(animationDataActions.editKeyframes());
  }, [dispatch]);

  return <IconWrapper icon={SvgPath.InsertKeyframe} hasFrame={false} onClick={handleClickButton} />;
};

export default InsertKeyframe;
