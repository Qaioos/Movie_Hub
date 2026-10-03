import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useFetch<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
  const abortRef = useRef<AbortController | null>(null);

  const execute = useCallback(() => {
    if (!fetcher) { setState({ data: null, loading: false, error: null }); return; }
    abortRef.current?.abort();
    setState(s => ({ ...s, loading: true, error: null }));
    fetcher()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => {
        if (err.name === 'AbortError') return;
        setState({ data: null, loading: false, error: err.message || 'An error occurred' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { ...state, refetch: execute };
}

export function useInfiniteScroll<T>(
  fetcher: (page: number) => Promise<{ results: T[]; total_pages: number }>,
  deps: unknown[] = []
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) return;
    setLoading(true);
    fetcher(page)
      .then(res => {
        setItems(prev => page === 1 ? res.results : [...prev, ...res.results]);
        setTotalPages(res.total_pages);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ...deps]);

  const loadMore = () => { if (!loading && page < totalPages) setPage(p => p + 1); };
  const hasMore = page < totalPages;

  return { items, loading, error, loadMore, hasMore, page };
}
