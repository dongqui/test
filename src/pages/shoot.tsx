import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Shoot'), { ssr: false });

export default DynamicWithNoSSR;
