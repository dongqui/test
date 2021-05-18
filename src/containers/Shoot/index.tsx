import { FunctionComponent, memo, Fragment, useCallback, useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { ContextMenu } from 'components/New_ContextMenu';
import { useRouter } from 'next/router';
import { useOutsideClick } from 'hooks/common/useOutsideClick';
import { storeContextMenuInfo, storeModalInfo, storePageInfo } from 'lib/store';
import { MODAL_TYPES, PAGE_NAMES } from 'types';
import { BaseModal } from 'components/New_Modal';
import { Headline } from 'components/Typography';
import Html from 'components/Typography/Html';
import axios from 'axios';
import MainPage from './MainPage';
import ExtractPage from 'containers/extract';
import Process from 'containers/Shoot/Process';

export type Procedure = 'service' | 'token' | 'success' | 'denied';

const ShootPage: FunctionComponent = () => {
  const router = useRouter();
  const { token } = router.query;

  const [procedure, setProcedure] = useState<Procedure>('service');
  const [_message, setMessage] = useState('');

  useEffect(() => {
    const isTokenLoaded = localStorage.getItem('token');

    const authToken = async (token: string) => {
      await axios({
        method: 'GET',
        url: 'http://115.85.182.106/verify',
        params: { token },
      })
        .then((response) => {
          console.log(response);

          localStorage.setItem('token', JSON.stringify(token));
          setProcedure('success');
        })
        .catch((error) => {
          const { message } = error;
          setProcedure('denied');
          setMessage(message);
        });
    };

    if (isTokenLoaded) {
      // 강제로 1초 딜레이를 줘서 애니메이션을 보여주기 위함
      setTimeout(() => {
        setProcedure('success');
      }, 1000);
    }

    if (!isTokenLoaded) {
      if (token && typeof token === 'string') {
        // 토근 인증 절차
        // 1. API로 쿼리스트링에 있는 토큰을 인증
        // 단. 그동안 1초는 반드시 delay 시키고 + api 통신 시간 만큼 process container 요청 패턴 로드
        setTimeout(() => {
          setProcedure('token');
        }, 1000);

        // 강제로 2초 딜레이를 줘서 동일 흐름에서 token 프로세스를 먼저 밟고 이후 api 통신
        setTimeout(() => {
          authToken(token);
        }, 2000);
        // 2. 인증 성공 시 로컬스토리지에 토큰 저장 후 shoot 페이지 로드
        // 3. 인증 실패 시 process container의 실패 패턴 로드
      }
    }
  }, [token]);

  const contextMenuInfo = useReactiveVar(storeContextMenuInfo);
  const modalInfo = useReactiveVar(storeModalInfo);
  const pageInfo = useReactiveVar(storePageInfo);
  const contextMenuRef = useRef<HTMLDivElement | any>(null);

  const handleClose = useCallback(() => {
    storeModalInfo({ ...modalInfo, isShow: false, msg: '' });
  }, [modalInfo]);

  useOutsideClick({
    ref: contextMenuRef,
    event: () => {
      storeContextMenuInfo({ ...contextMenuInfo, isShow: false });
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
      {_.isEqual(pageInfo.page, PAGE_NAMES.shoot) && <MainPage />}
      {_.includes([PAGE_NAMES.extract, PAGE_NAMES.record], pageInfo.page) && <ExtractPage />}
    </main>
  );
};

export default memo(ShootPage);
