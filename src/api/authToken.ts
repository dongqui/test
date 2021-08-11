import requestApi from 'api/requestApi';

interface Params {
  token: string;
}

const authToken = async (params: Params) => {
  const { token } = params;

  await requestApi({
    method: 'GET',
    base: 'https://api.plask.ai' ,
    url: '/verify',
    params: {
      token,
    },
  }).then(() => {
    localStorage.setItem('token', JSON.stringify(token));
  }).catch((error) => {
    throw error;
  });
};

export default authToken;