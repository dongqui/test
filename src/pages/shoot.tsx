import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/shoot'), { ssr: false });

export default DynamicWithNoSSR;
