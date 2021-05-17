import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/index'), { ssr: false });

export default DynamicWithNoSSR;
