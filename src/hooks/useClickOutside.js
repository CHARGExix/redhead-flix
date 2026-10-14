import { useEffect } from 'react';

export function useClickOutside(ref, callback) {
  useEffect(() => {
    const handler = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      callback(event);
    };

    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [ref, callback]);
}
