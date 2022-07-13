import { Middleware } from 'redux';
import requestApi from 'api/requestApi';

// import axios from 'axios';
// axios.defaults.withCredentials = true;

/**
 * middleware를 통해 액션을 스토어로 전달하기 전 추가 작업을 처리한다.
 * 로그, 액션 취소, 다른 액션 트리거 등
 * 또한 비동기적인 요청을 받기 위해 사용한다.
 */
const middleware: Middleware = () => {
  return (next) => (action) => {
    const { promise, type, api, ...rest } = action;

    if (promise) {
      const { api, ...restPromise } = promise;
      const fetch = api ? api(restPromise) : requestApi(promise);

      return fetch
        .then((result: unknown) => {
          next({ ...rest, payload: result, type: `${type}_SUCCESS` });
        })
        .catch((error: unknown) => {
          next({ ...rest, payload: error, type: `${type}_FAILURE` });
        });
    } else {
      next({ ...rest, type: type });
    }
  };
};

export default middleware;
