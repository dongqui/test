import React, { useCallback } from 'react';

import { IconWrapper, SvgPath } from 'components/Icon';

const InsertKeyframe = () => {
  const handleClickButton = useCallback(() => {}, []);

  return <IconWrapper icon={SvgPath.InsertKeyframe} hasFrame={false} onClick={handleClickButton} />;
};

export default InsertKeyframe;
