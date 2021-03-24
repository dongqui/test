import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Shoot'), { ssr: true });

export default DynamicWithNoSSR;
