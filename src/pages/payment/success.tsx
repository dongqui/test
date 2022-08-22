import Cookie from 'js-cookie';
import { useEffect } from 'react';
import { GetServerSideProps } from 'next';

import { useInterval } from 'hooks/common';
import { getUserPlanInfo } from 'api';
import { tokenManager } from 'api/requestApi';

interface PageProps {
  token: string;
}

export default function Success({ token }: PageProps) {
  useEffect(() => {
    tokenManager.set(token);

    if (!window.opener) {
      window.location.href = '/';
    }
  }, [token]);

  useInterval(1000, async () => {
    const planInfo = await getUserPlanInfo();
    // TODO: 좀 더 확장성 있게...!
    if (window?.opener && planInfo.name === 'Motion Capture Pro') {
      window?.opener?.document?.getElementById('handle-payment-success').click();
      window.close();
    }
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <h1
        style={{
          color: 'white',
          fontSize: '60px',
        }}
      >
        결제 진행중입니다~~~~~ <br />
        하고 우리 서버에 유저 정보 갱신 될 때 까지 시간끌기~~~~
      </h1>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = process.env.NODE_ENV === 'development' ? process.env.DEV_LOCAL_TOKEN : context.req?.cookies?.authToken;

  return {
    props: {
      token: token || '',
    },
  };
};
