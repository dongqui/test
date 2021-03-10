import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/realtime'), { ssr: false });

export default DynamicWithNoSSR;
