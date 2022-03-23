import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import requestApi from 'api/requestApi';

const DynamicWithNoSSR = dynamic(() => import('containers/index'), { ssr: false });

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const { token, sceneUid } = query;

  const { loaded, data, error } = await requestApi({
    method: 'GET',
    url: `library/${sceneUid}`,
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

  return {
    props: {
      loaded,
      data,
      error,
    },
  };
};

export default DynamicWithNoSSR;
