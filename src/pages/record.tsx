import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/record'), { ssr: false });

export default DynamicWithNoSSR;
