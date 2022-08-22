import { useEffect } from 'react';

export default function Payment() {
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    const stripeUrl = url.get('stripeURL');
    if (stripeUrl) {
      window.location.href = stripeUrl + (window.location.hash || '');
    }
  }, []);

  return <></>;
}
