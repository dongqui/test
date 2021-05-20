import _ from 'lodash';
import {
  FunctionComponent,
  memo,
  Fragment,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useRouter } from 'next/router';
import { storeContextMenuInfo, storeModalInfo, storePageInfo } from 'lib/store';
import { useReactiveVar } from '@apollo/client';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { ContextMenu } from 'components/ContextMenu';
import { MODAL_TYPES } from 'types';
import { BaseModal } from 'components/Modal';
import { Headline, Html } from 'components/Typography';
import axios from 'axios';
import Process from 'containers/Shoot/Process';
import ShootContainer from 'containers/Shoot';
import ExtractContainer from 'containers/Extract';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

const Index: FunctionComponent = () => {
  const router = useRouter();
  const { token } = router.query;

  const [procedure, setProcedure] = useState<Procedure>('service');
  const [_message, setMessage] = useState('');

  useLayoutEffect(() => {
    const isTokenLoaded = localStorage.getItem('token');

    const authToken = async (token: string) => {
      await axios({
        method: 'GET',
        url: 'https://api.plask.ai/verify',
        params: { token },
      })
        .then(() => {
          // 3. 인증 성공 시 로컬스토리지에 토큰 저장 후 shoot 페이지 로드
          localStorage.setItem('token', JSON.stringify(token));
          setProcedure('success');
        })
        .catch((error) => {
          // 4. 인증 실패 시 process container의 실패 패턴 로드
          const { message } = error;
          setProcedure('denied');
          setMessage(message);
        });
    };

    if (isTokenLoaded) {
      // 로컬스토리지에 토큰이 있는 경우는 이미 인증이 최소 1번 성공한 케이스로 바로 shoot 로드
      setProcedure('success');
    }

    if (!isTokenLoaded) {
      // 토근 인증 절차
      // 1. API로 쿼리스트링에 있는 토큰을 인증
      // 단. 그동안 2초는 반드시 delay 시키고 + api 통신 시간 만큼 process container 요청 패턴 로드
      setTimeout(() => {
        setProcedure('token');
      }, 2000);

      // 2. 쿼리스트링 토큰 자체가 없는 경우 token 프로세스를 먼저 밟고 denied 처리
      if (!token) {
        setTimeout(() => {
          setProcedure('denied');
        }, 4000);
      }

      if (token && typeof token === 'string') {
        // 3. 강제로 4초 딜레이를 줘서 동일 흐름에서 token 프로세스를 먼저 밟고 이후 api 통신
        setTimeout(() => {
          authToken(token);
        }, 4000);
      }
    }
  }, [token]);

  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      if (contextMenuInfo.isShow) {
        storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
      }
    },
  });

  useEffect(() => {
    if (window) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
      };

      window.addEventListener('contextmenu', handleContextMenu);

      return () => {
        window.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [contextMenuInfo.isShow]);

  const isShootMode = _.isEqual(pageInfo.page, 'shoot');

  if (procedure !== 'success') {
    return (
      <main>
        <Process procedure={procedure} />
      </main>
    );
  }

  return (
    <main>
      {contextMenuInfo.isShow && (
        <ContextMenu
          innerRef={contextMenuRef}
          position={{
            top: `${contextMenuInfo.top}px`,
            left: `${contextMenuInfo.left}px`,
          }}
          onSelect={contextMenuInfo.onClick}
          list={contextMenuInfo.data}
        />
      )}
      {modalInfo.isShow && (
        <Fragment>
          {_.isEqual(modalInfo.type, MODAL_TYPES.alert) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
          {_.isEqual(modalInfo.type, MODAL_TYPES.loading) && (
            <BaseModal onClose={handleClose}>
              <Headline level="5" align="center">
                <Html content={modalInfo.msg} />
              </Headline>
            </BaseModal>
          )}
        </Fragment>
      )}
      {isShootMode ? <ShootContainer /> : <ExtractContainer />}
    </main>
  );
};

export default memo(Index);
