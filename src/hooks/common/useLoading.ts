import { useEffect, useState } from 'react';

export const useLoading = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const body = document.querySelector('body');
    if (loading) {
      if (body) {
        body.style.cursor = 'wait';
      }
    } else {
      if (body) {
        body.style.cursor = 'default';
      }
    }
  }, [loading]);
  return { setLoading };
};
