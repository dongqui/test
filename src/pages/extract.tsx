import dynamic from 'next/dynamic';

const DynamicWithNoSSR = dynamic(() => import('containers/extract'), { ssr: false });

export default DynamicWithNoSSR;
