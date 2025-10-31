import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLanguages, fetchMessages, Language, Messages } from '@/services/i18n';

export type I18nContextValue = {
  locale: string;
  setLocale: (code: string) => void;
  languages: Language[];
  messages: Messages;
  t: (key: string, fallback?: string) => string;
  loading: boolean;
  refresh: () => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const getInitialLocale = () => {
    try { return localStorage.getItem('sp.locale') || 'zh-CN'; } catch { return 'zh-CN'; }
  };
  const [locale, setLocaleState] = useState<string>(getInitialLocale);
  const [languages, setLanguages] = useState<Language[]>([]);
  const cache = useRef(new Map<string, Messages>());
  const [messages, setMessages] = useState<Messages>({});
  const [loading, setLoading] = useState<boolean>(false);

  const applyLocale = useCallback((code: string) => {
    try { localStorage.setItem('sp.locale', code); } catch {}
    setLocaleState(code);
    try {
      // 广播语言变化（antd 等监听者用）
      window.dispatchEvent(new CustomEvent('sp-set-locale', { detail: code }));
      // 不在此处刷新路由，等消息拉取完成后再刷新
    } catch {}
  }, []);

  // expose setter that also persists and emits event
  const setLocale = useCallback((code: string) => {
    applyLocale(code);
  }, [applyLocale]);

  // listen external locale changes (e.g., from other micro apps)
  useEffect(() => {
    const handler = (e: any) => {
      const next = (e?.detail as string) || 'zh-CN';
      setLocaleState(next);
    };
    window.addEventListener('sp-set-locale', handler as EventListener);
    return () => window.removeEventListener('sp-set-locale', handler as EventListener);
  }, []);

  // load languages once
  useEffect(() => {
    (async () => {
      const list = await fetchLanguages();
      setLanguages(list);
    })().catch(() => {});
  }, []);

  const loadMessages = useCallback(async (lng: string) => {
    if (cache.current.has(lng)) {
      const cached = cache.current.get(lng)!;
      setMessages(cached);
      // 先同步更新全局，确保后续刷新时可见
      (window as any).spI18n = {
        t: (key: string, fallback?: string) => cached[key] ?? fallback ?? key,
        locale: lng,
        setLocale,
        messages: cached,
      };
      return;
    }
    setLoading(true);
    try {
      const data = await fetchMessages(lng);
      cache.current.set(lng, data);
      setMessages(data);
      // 先同步更新全局，确保后续刷新时可见
      (window as any).spI18n = {
        t: (key: string, fallback?: string) => data[key] ?? fallback ?? key,
        locale: lng,
        setLocale,
        messages: data,
      };
    } finally {
      setLoading(false);
    }
  }, [setLocale]);

  // load messages when locale changes，并在加载完成后刷新当前路由以强制重挂载
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadMessages(locale).catch(() => {});
      if (cancelled) return;
      try {
        const fromHash = typeof window !== 'undefined' && window.location.hash ? window.location.hash.replace(/^#/, '') : undefined;
        const currentPath = fromHash || (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
        window.dispatchEvent(new CustomEvent('sp-refresh-route', { detail: { path: currentPath } }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [locale, loadMessages]);

  const t = useCallback((key: string, fallback?: string) => {
    return messages[key] ?? fallback ?? key;
  }, [messages]);

  const refresh = useCallback(async () => {
    cache.current.delete(locale);
    await loadMessages(locale);
  }, [locale, loadMessages]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    languages,
    messages,
    t,
    loading,
    refresh,
  }), [locale, setLocale, languages, messages, t, loading, refresh]);

  // 暴露到全局，便于微前端直接使用 window.spI18n.t
  useEffect(() => {
    (window as any).spI18n = { t, locale, setLocale, messages };
  }, [t, locale, setLocale, messages]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
