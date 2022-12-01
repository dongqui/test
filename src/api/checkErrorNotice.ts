import requestApi from './requestApi';

export default async function checkErrorNotice() {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL,
    url: `/error-notice`,
  });

  return response.data;
}
