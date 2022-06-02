import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import requestApi from 'api/requestApi';
import Cookies from 'js-cookie';

const DynamicWithNoSSR = dynamic(() => import('containers/index'), { ssr: false });

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  let { sceneUid } = query;
  let token = context.req?.cookies?.authToken;
  if (process.env.NODE_ENV === 'development') {
    token = process.env.DEV_TOKEN || '';
    sceneUid = process.env.DEV_SCENE_ID;
  }
  /**
   * Possible error cases when accessing the app from the homepage
   * 401.1 - Invalid token
   * 401.2 - Expired token
   * 400 - No permission scene
   * 400.7 - Invalid scene uid
   */

  const { loaded, data, error } = await requestApi({
    method: 'GET',
    url: `/library/get/${sceneUid}/library`,
    headers: {
      Authorization: `bearer ${token}`,
    },
  })
    .then((response) => {
      return {
        loaded: true,
        error: null,
        data: response.data,
      };
    })
    .catch((error) => {
      return {
        loaded: false,
        data: [],
        error: error,
      };
    });

  if (error && error.statusCode === 401.2) {
    Cookies.remove('authToken');
  }

  return {
    props: {
      loaded,
      data,
      error,
      ...(error ? {} : { token, sceneId: sceneUid }),
    },
  };
};

export default DynamicWithNoSSR;
