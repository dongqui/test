import Cookie from 'react-cookies';
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
  [key: string]: any;
}

const requestApi = async (payload: Payload) => {
  const { base, url, headers = {}, ...rest } = payload;

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

  const notEqualHost = appHostname !== apiHostname;
  const needsProxy = !isServer && notEqualHost;
  const endpoint = url;

  const baseURL = needsProxy ? '/api' : (base || process.env.API_URL);

  /**
   * @todo 현재 timeout 미지정. length * 7-8s 예상 중
   */
  const options = {
    ...rest,
    headers,
    baseURL,
    url: endpoint,
    // timeout: 15000,
  };

  // axios.defaults.withCredentials = true;
  options.headers['Accept'] = 'application/json';
  options.headers['Content-Type'] = 'application/json; charset=utf-8';

  if (isServer) {
    const token = Cookie.load('token');

    if (token) {
      options.headers['Cookie'] = `token=${token}`;
    }
  }

  try {
    const response = await axios(options);

    return response.data;
  } catch (e) {
    const response = e.response;
    const error = (response && response.data) || {
      success: false,
      status: response ? response.status : 500,
      message: response
        ? response.statusText
        : 'An error has occurred. Please refresh and try again',
    };

    throw error;
  }
};

export default requestApi;
