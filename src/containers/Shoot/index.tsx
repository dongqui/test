import React, { FunctionComponent, memo } from 'react';

import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Shoot/Shoot'), { ssr: false });

export interface Props {}

const ShootPage: FunctionComponent<Props> = () => {
  return <DynamicWithNoSSR />;
};

export default memo(ShootPage);
