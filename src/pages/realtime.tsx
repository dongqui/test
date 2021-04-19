import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Realtime'), { ssr: false });

export default DynamicWithNoSSR;
