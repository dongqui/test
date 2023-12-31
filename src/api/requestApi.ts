import parseUrl from 'url-parse';
import axios, { Method } from 'axios';

// AxiosRequestConfig와 일부 타입 통일(headers, params, data)
interface Payload {
  method: Method;
  base?: string;
  url: string;
  headers?: any;
  params?: any;
  data?: any;
  cancelToken?: any;
  timeout?: number;
  [key: string]: any;
}

export const tokenManager = {
  token: '',
  get() {
    return this.token;
  },
  set(token: string) {
    this.token = token;
  },
};

const requestApi = async (payload: Payload, hasToken = true) => {
  const { base, url, headers = {}, cancelToken, timeout, ...rest } = payload;

  const isServer = typeof window === 'undefined';

  /**
   * 보안 및 캐시를 위해 프록시를 적용
   *
   * API 서버와 프론트엔드가 도메인이 다른 경우, SSR에서 쿠키 사용이 불가.
   * JWT 쿠키를 SSR에서도 사용할 수 있도록 proxy를 이용해서 외부 API를 호출시킨다.
   *
   * 따라서, API 서버 주소와 프론트엔드 주소가 동일하게 되서
   * 쿠키의 domain 값이 프론트엔드 주소를 사용하게 되므로 SSR에서 쿠키를 사용할 수 있음
   *
   * 단, 두 주소의 hostname이 동일한 경우 proxy를 사용하지 않음
   * port만 달라도 프록시가 안되는 문제가 있을 수 있음
   *
   * @example http://현재도메인/api/v1/...
   */
  const appHostname = parseUrl(process.env.APP_URL as string).hostname;
  const apiHostname = parseUrl(process.env.API_URL as string).hostname;

  // const notEqualHost = appHostname !== apiHostname;
  // const needsProxy = !isServer && notEqualHost;
  // const endpoint = url;

  // const baseURL = needsProxy ? '/api' : base || process.env.NEXT_PUBLIC_BACKEND_API_URL;

  /**
   * @todo 현재 timeout 미지정. length * 7-8s 예상 중
   */

  const options = {
    headers,
    baseURL: base || process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: url,
    cancelToken,
    timeout,
    ...rest,
    // timeout: 15000,
  };

  // axios.defaults.withCredentials = true;
  options.headers['Accept'] = 'application/json';
  options.headers['Content-Type'] = 'application/json; charset=utf-8';
  if (hasToken && tokenManager.get()) {
    options.headers['authorization'] = `Bearer ${tokenManager.get()}`;
  }
  // if (isServer) {
  //   const token = Cookie.load('token');

  //   if (token) {
  //     options.headers['Cookie'] = `token=${token}`;
  //   }
  // }

  try {
    const response = await axios(options);

    return response.data;
  } catch (e: any) {
    const axiosError = { ...e };
    const isCancel = axios.isCancel(e);
    const isTimeout = axiosError.code === 'ECONNABORTED';
    const response = e.response;

    if (isCancel) {
      const error = {
        isCancel: true,
      };

      throw error;
    }

    if (isTimeout) {
      const error = {
        success: false,
        status: 408,
        message: `timeout of ${timeout}ms exceeded`,
      };

      throw error;
    }

    const error = (response && response.data) || {
      success: false,
      status: response ? response.status : 500,
      message: response ? response.statusText : 'An error has occurred. Please refresh and try again',
    };

    throw error;
  }
};

export default requestApi;
