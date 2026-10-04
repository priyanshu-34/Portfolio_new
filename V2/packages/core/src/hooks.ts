import { useEffect, useState } from 'react';
import { initialPortfolio, loadPortfolio, type PortfolioResult } from './portfolio';
import { isAdmin, watchUser, type User } from './auth';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | undefined;
  loading: boolean;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: undefined, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: undefined }));
    fn().then(
      (data) => alive && setState({ data, error: undefined, loading: false }),
      (error) => alive && setState({ data: undefined, error, loading: false }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick((t) => t + 1) };
}

let lastResult: PortfolioResult | null = null;

/** Portfolio content; renders instantly from cache and refreshes from Firestore. */
export function usePortfolio(): { data: PortfolioResult; loading: boolean } {
  const [result, setResult] = useState<PortfolioResult>(() => lastResult ?? initialPortfolio());
  const [loading, setLoading] = useState(!lastResult);
  useEffect(() => {
    let alive = true;
    loadPortfolio().then((r) => {
      lastResult = r;
      if (alive) {
        setResult(r);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);
  return { data: result, loading };
}

export function useAuth(): { user: User | null; admin: boolean; ready: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(
    () =>
      watchUser((u) => {
        setUser(u);
        setReady(true);
      }),
    [],
  );
  return { user, admin: isAdmin(user), ready };
}

export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}
