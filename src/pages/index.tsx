import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/Main'), { ssr: false });

export default DynamicWithNoSSR;
