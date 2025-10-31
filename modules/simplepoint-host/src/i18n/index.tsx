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
  ready: boolean;
  ensure: (ns: string[]) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const getInitialLocale = () => {
    try { return localStorage.getItem('sp.locale') || 'zh-CN'; } catch { return 'zh-CN'; }
  };
  const initialLocale = getInitialLocale();

  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 小时
  const cacheKey = (lng: string) => `sp.i18n.messages.${lng}`;
  const cacheTsKey = (lng: string) => `sp.i18n.cachedAt.${lng}`;

  const readStoredMessages = (lng: string): Messages | undefined => {
    try {
      const tsRaw = localStorage.getItem(cacheTsKey(lng));
      if (!tsRaw) return undefined;
      const ts = Number(tsRaw);
      if (!Number.isFinite(ts) || Date.now() - ts > CACHE_TTL_MS) return undefined;
      const raw = localStorage.getItem(cacheKey(lng));
      if (raw) return JSON.parse(raw) as Messages;
    } catch {}
    return undefined;
  };

  const writeStoredMessages = (lng: string, data: Messages) => {
    try {
      localStorage.setItem(cacheKey(lng), JSON.stringify(data));
      localStorage.setItem(cacheTsKey(lng), String(Date.now()));
    } catch {}
  };

  const [locale, setLocaleState] = useState<string>(initialLocale);
  const [languages, setLanguages] = useState<Language[]>([]);
  const cache = useRef(new Map<string, Messages>());
  const initialMessages = readStoredMessages(initialLocale) || {};
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [loading, setLoading] = useState<boolean>(false);
  const missingKeysRef = useRef<Set<string>>(new Set());

  // 若本地有缓存，预先注入 cache 与 window，减少首屏闪烁
  useEffect(() => {
    if (Object.keys(initialMessages).length > 0) {
      cache.current.set(initialLocale, initialMessages);
      (window as any).spI18n = {
        t: (key: string, fallback?: string) => initialMessages[key] ?? (initialLocale === 'zh-CN' ? (fallback ?? key) : key),
        locale: initialLocale,
        setLocale: (code: string) => applyLocale(code),
        messages: initialMessages,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // 1) 内存缓存（忽略空对象）
    if (cache.current.has(lng)) {
      const cached = cache.current.get(lng)!;
      if (cached && Object.keys(cached).length > 0) {
        setMessages(cached);
        (window as any).spI18n = {
          t: (key: string, fallback?: string) => cached[key] ?? (lng === 'zh-CN' ? (fallback ?? key) : key),
          locale: lng,
          setLocale,
          messages: cached,
        };
        return;
      }
    }
    // 2) 本地存储缓存（忽略空对象 + TTL）
    const stored = readStoredMessages(lng);
    if (stored && Object.keys(stored).length > 0) {
      cache.current.set(lng, stored);
      setMessages(stored);
      (window as any).spI18n = {
        t: (key: string, fallback?: string) => stored[key] ?? (lng === 'zh-CN' ? (fallback ?? key) : key),
        locale: lng,
        setLocale,
        messages: stored,
      };
      return;
    }

    // 3) 网络请求
    setLoading(true);
    try {
      const data = await fetchMessages(lng);
      cache.current.set(lng, data);
      setMessages(data);
      writeStoredMessages(lng, data);
      (window as any).spI18n = {
        t: (key: string, fallback?: string) => data[key] ?? (lng === 'zh-CN' ? (fallback ?? key) : key),
        locale: lng,
        setLocale,
        messages: data,
      };
    } finally {
      setLoading(false);
    }
  }, [setLocale]);

  // 按命名空间增量加载与合并
  const ensure = useCallback(async (ns: string[]) => {
    const lng = locale;
    if (!Array.isArray(ns) || ns.length === 0) return;
    // 简单的去重：若已存在对应前缀的 key，则跳过网络；这里仍发起请求以便覆盖更新
    const data = await fetchMessages(lng, ns).catch(() => ({}));
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessages(prev => {
        const merged = { ...prev, ...data } as Messages;
        cache.current.set(lng, merged);
        return merged;
      });
    }
  }, [locale]);

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
    const v = messages[key];
    if (v !== undefined) return v;
    // 记录缺失键（开发环境）
    if (process.env.NODE_ENV !== 'production') {
      const mk = `${locale}::${key}`;
      if (!missingKeysRef.current.has(mk)) {
        missingKeysRef.current.add(mk);
        try { console.warn(`[i18n] Missing key: ${key} (locale: ${locale})`); } catch {}
        try { window.dispatchEvent(new CustomEvent('sp-i18n-missing', { detail: { locale, key } })); } catch {}
      }
    }
    return locale === 'zh-CN' ? (fallback ?? key) : key;
  }, [messages, locale]);

  const refresh = useCallback(async () => {
    cache.current.delete(locale);
    try { localStorage.removeItem(cacheKey(locale)); localStorage.removeItem(cacheTsKey(locale)); } catch {}
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
    ready: !loading && Object.keys(messages || {}).length > 0,
    ensure,
  }), [locale, setLocale, languages, messages, t, loading, refresh, ensure]);

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
