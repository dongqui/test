import { FunctionComponent, memo, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authToken } from 'api';
import Process from 'containers/Process';
// import Extract from 'containers/Extract';
import Shoot from 'containers/Shoot';
import { ResizeProvider } from 'contexts/LS/ResizeContext';
import { useSelector } from 'reducers';
import { VideoMode } from 'containers/VideoMode';
// import Process from 'containers/Process';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

interface Props {
  browserType: string;
}

const Index: FunctionComponent<Props> = ({ browserType }) => {
  const router = useRouter();
  const { token } = router.query;

  const [currentMode, setCurrentMode] = useState<string | null>('trackMode');
  // const [procedure, setProcedure] = useState<Procedure>('service');

  // const [_message, setMessage] = useState('');

  // useLayoutEffect(() => {
  //   const isTokenLoaded = localStorage.getItem('token');

  //   if (isTokenLoaded) {
  //     // 로컬스토리지에 토큰이 있는 경우는 이미 인증이 최소 1번 성공한 케이스로 바로 shoot 로드
  //     setProcedure('success');
  //   }

  //   if (!isTokenLoaded) {
  //     // 토근 인증 절차
  //     // 1. API로 쿼리스트링에 있는 토큰을 인증
  //     // 단. 그동안 2초는 반드시 delay 시키고 + api 통신 시간 만큼 process container 요청 패턴 로드
  //     setTimeout(() => {
  //       setProcedure('token');
  //     }, 2000);
  //     // 2. 쿼리스트링 토큰 자체가 없는 경우 token 프로세스를 먼저 밟고 denied 처리
  //     if (!token) {
  //       setTimeout(() => {
  //         setProcedure('denied');
  //       }, 4000);
  //     }

  //     if (token && typeof token === 'string') {
  //       // 3. 강제로 4초 딜레이를 줘서 동일 흐름에서 token 프로세스를 먼저 밟고 이후 api 통신
  //       setTimeout(async () => {
  //         await authToken({
  //           token,
  //         })
  //           .then(() => {
  //             setProcedure('success');
  //           })
  //           .catch((error) => {
  //             setProcedure('denied');
  //             setMessage(error.message);
  //           });
  //       }, 4000);
  //     }
  //   }
  // }, [token]);

  // if (procedure !== 'success') {
  //   return (
  //     <main>
  //       <Process procedure={procedure} />
  //     </main>
  //   );
  // }

  useEffect(() => {
    const getShootMode = () => {
      window.addEventListener('storage', () => {
        const hasMode = window.localStorage.getItem('shootMode');
        setCurrentMode(hasMode);
      });
    };
    getShootMode();
  }, []);

  return (
    <main>
      {currentMode === 'trackMode' ? (
        <ResizeProvider>
          <Shoot />
        </ResizeProvider>
      ) : (
        <VideoMode browserType={browserType} />
      )}
    </main>
  );
};

export default memo(Index);
