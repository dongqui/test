import React, { FunctionComponent, memo } from 'react';

import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Shoot/Shoot'), { ssr: false });

export interface Props {
  defaultModelList: string[];
}

const ShootPage: FunctionComponent<Props> = ({ defaultModelList }) => {
  return <DynamicWithNoSSR data={defaultModelList} />;
};

export default memo(ShootPage);
