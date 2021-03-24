import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/record'), { ssr: true });

export default DynamicWithNoSSR;
