import Cookies from 'js-cookie';
import requestApi from './requestApi';

export default async function createStripeSession(isMonthly: boolean) {
  const cookie = Cookies.get('_ga');
  const interval = isMonthly ? 'month' : 'year';
  const res = await requestApi({
    method: 'POST',
    base: process.env.NEXT_PUBLIC_BACKEND_HOMEPAGE_URL,
    url: '/payment/tool',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      clientIdForGa: cookie ? cookie.split('.').slice(-2).join('.') : '',
      successUrl: window.location.origin + '/payment/success',
      failedUrl: window.location.origin + `/payment/failure?interval=${interval}`,
      interval,
    },
  });

  return res.data;
}
