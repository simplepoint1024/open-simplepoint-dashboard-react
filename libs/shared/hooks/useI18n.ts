import { useCallback, useEffect, useMemo, useState } from 'react';

export type Messages = Record<string, string>;

export type I18nLike = {
  t: (key: string, fallbackOrParams?: string | Record<string, unknown>, maybeParams?: Record<string, unknown>) => string;
  locale: string;
  setLocale: (code: string) => void;
  messages: Messages;
  ensure: (ns: string[]) => Promise<void> | void;
};

const isBrowser = typeof window !== 'undefined';

const interpolate = (tpl: string, params?: Record<string, unknown>) =>
  params
    ? tpl.replace(/\{(\w+)}/g, (_, k: string) =>
      params[k] !== undefined ? String(params[k]) : `{${k}}`
    )
    : tpl;

export const mkT = (messages: Messages): I18nLike['t'] => (key, fallbackOrParams, maybeParams) => {
  const fallback = typeof fallbackOrParams === 'string' ? fallbackOrParams : undefined;
  const params =
    typeof fallbackOrParams === 'object' ? fallbackOrParams :
      typeof maybeParams === 'object' ? maybeParams :
        undefined;
  const raw = messages[key] ?? fallback ?? key;
  return interpolate(raw, params);
};

function getGlobal(): I18nLike | undefined {
  return isBrowser ? (window as any).spI18n : undefined;
}

// 命名空间加载缓存和锁
const nsLoadedCache = new Set<string>();
const nsLoadingMap = new Map<string, Promise<void>>();

export function useI18n() {
  const [locale, setLocaleState] = useState<string>('zh-CN');
  const [messages, setMessages] = useState<Messages>({});
  const [tImpl, setTImpl] = useState<I18nLike['t']>(() => mkT({}));

  const refreshFromGlobal = useCallback(() => {
    const g = getGlobal();
    if (!g) return;
    setLocaleState(g.locale);
    setMessages(g.messages || {});
    setTImpl(() => g.t ?? mkT(g.messages || {}));
  }, []);

  const setLocale = useCallback((code: string) => {
    try {
      getGlobal()?.setLocale?.(code);
    } catch {
      setLocaleState(code);
    }
  }, []);

  const ensure = useCallback(async (ns: string[]) => {
    const g = getGlobal();
    if (!g?.ensure) return;

    const merged = Array.from(new Set(ns)).sort();
    const key = `${g.locale}::${merged.join(',')}`;

    if (nsLoadedCache.has(key)) return;
    if (nsLoadingMap.has(key)) {
      await nsLoadingMap.get(key);
      return;
    }

    const loadPromise = (async () => {
      try {
        await g.ensure(merged);
        nsLoadedCache.add(key);
      } catch (e) {
        console.warn('[i18n] ensure failed:', e);
      } finally {
        nsLoadingMap.delete(key);
        refreshFromGlobal();
      }
    })();

    nsLoadingMap.set(key, loadPromise);
    await loadPromise;
  }, [refreshFromGlobal]);

  useEffect(() => {
    if (!isBrowser) return;
    refreshFromGlobal();
    const onUpdated = () => refreshFromGlobal();
    window.addEventListener('sp-i18n-updated', onUpdated);
    return () => window.removeEventListener('sp-i18n-updated', onUpdated);
  }, [refreshFromGlobal]);

  const ready = useMemo(() => Object.keys(messages).length > 0, [messages]);

  return {
    t: tImpl,
    locale,
    setLocale,
    messages,
    ensure,
    ready,
  } as const;
}
