import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/extract'), { ssr: true });

export default DynamicWithNoSSR;
