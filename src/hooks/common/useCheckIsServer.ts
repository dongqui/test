import { useEffect, useState } from 'react';

export const useCheckIsServer = () => {
  const [isServer, setIsServer] = useState(true);
  useEffect(() => {
    if (window) {
      setIsServer(false);
    }
  }, []);
  return { isServer };
};
