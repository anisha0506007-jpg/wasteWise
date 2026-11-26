import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../utils/errors.js';

function useFetch(fetcher, key = 'default') {
  const fetcherRef = useRef(fetcher);
  const requestId = useRef(0);
  const [state, setState] = useState({ data: null, loading: true, refreshing: false, error: '' });

  // Always call the latest version of the fetcher function
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current;
    setState((prev) =>
      silent ? { ...prev, refreshing: true } : { ...prev, loading: true, error: '' }
    );

    try {
      const data = await fetcherRef.current();
      if (id === requestId.current) {
        setState({ data, loading: false, refreshing: false, error: '' });
      }
    } catch (error) {
      if (id === requestId.current) {
        setState((prev) => ({
          data: prev.data,
          loading: false,
          refreshing: false,
          error: getErrorMessage(error),
        }));
      }
    }
  }, []);

  useEffect(() => {
    load();
    // Newer requests win. Answers from older ones (or after unmount) are ignored.
    return () => {
      requestId.current += 1;
    };
  }, [load, key]);

  return { ...state, reload: load };
}

export default useFetch;