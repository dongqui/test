import { useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const IndexPage = () => {
  const onSayHiClick = () => {
    // global.ipcRenderer.send('message', 'hi from next');
  };

  return (
    <Layout title="Home | Next.js + TypeScript + Electron Example">
      <h1>Hello Next.js 👋</h1>
      <button onClick={onSayHiClick}>Say hi to electron</button>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </Layout>
  );
};

export default IndexPage;
