import requestApi from '../requestApi';

export async function getUser() {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_HOMEPAGE_URL,
    url: `/users`,
  });

  return response.data;
}

export async function getUserUsageInfo() {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_HOMEPAGE_URL,
    url: `/users/settings/tool`,
  });

  return response.data;
}

export async function getUserStorageInfo() {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_HOMEPAGE_URL,
    url: `/users/settings/tool/storage`,
  });

  return response.data;
}

export async function getUserCreditInfo() {
  const response = await requestApi({
    method: 'GET',
    base: process.env.NEXT_PUBLIC_BACKEND_HOMEPAGE_URL,
    url: `/users/settings/tool/credits`,
  });

  return response.data;
}
