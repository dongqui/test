import requestApi from 'api/requestApi';

interface Params {
  token: string;
}

/**
 * shoot access를 위한 인증 api
 *
 * @param token - shoot access를 위한 홈페이지에서 발급받은 인증 토큰
 * @todo 추후, api 안정화 및 팀 프로젝트 개발 여부에 따라 삭제 또는 base url dotenv로 별도 분리 예정
 */
const authToken = async (params: Params) => {
  const { token } = params;

  await requestApi({
    method: 'GET',
    base: 'https://api.plask.ai',
    url: '/verify',
    params: {
      token,
    },
  })
    .then(() => {
      localStorage.setItem('token', JSON.stringify(token));
    })
    .catch((error) => {
      throw error;
    });
};

export default authToken;
