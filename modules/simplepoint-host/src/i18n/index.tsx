import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchLanguages, fetchMessages, Language, Messages } from '@/services/i18n';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(calendar);

// 版本化缓存（部署后可手动提升版本使缓存失效）
const APP_I18N_VERSION = '1';
const VERSION_KEY = 'sp.i18n.version';
const FORCE_REMOUNT_ON_LOCALE_CHANGE = true;
const isForceRemount = () => {
  try { const v = localStorage.getItem('sp.i18n.forceRemount'); if (v === 'false') return false; if (v === 'true') return true; } catch {}
  return FORCE_REMOUNT_ON_LOCALE_CHANGE;
};

const isRTL = (lng: string) => /^(ar|he|fa|ur)(-|$)/i.test(lng);

const mapDayjsLocale = (lng: string) => {
  const norm = (lng || '').toLowerCase();
  if (norm.startsWith('zh-cn')) return 'zh-cn';
  if (norm.startsWith('zh-tw')) return 'zh-tw';
  if (norm.startsWith('en-gb')) return 'en-gb';
  if (norm.startsWith('en')) return 'en';
  if (norm.startsWith('ja')) return 'ja';
  if (norm.startsWith('ko')) return 'ko';
  if (norm.startsWith('fr')) return 'fr';
  if (norm.startsWith('de')) return 'de';
  if (norm.startsWith('es')) return 'es';
  if (norm.startsWith('pt-br')) return 'pt-br';
  if (norm.startsWith('ru')) return 'ru';
  return 'en';
};

export type I18nContextValue = {
  locale: string;
  setLocale: (code: string) => void;
  languages: Language[];
  messages: Messages;
  t: (key: string, fallbackOrParams?: string | Record<string, any>, maybeParams?: Record<string, any>) => string;
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

  const clearI18nCaches = () => {
    try {
      const rm: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i) || '';
        if (k.startsWith('sp.i18n.messages.') || k.startsWith('sp.i18n.cachedAt.')) rm.push(k);
      }
      rm.forEach(k => localStorage.removeItem(k));
    } catch {}
  };

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

  // 初始化时进行版本校验，必要时清理旧缓存
  useEffect(() => {
    try {
      const storedV = localStorage.getItem(VERSION_KEY);
      if (storedV !== APP_I18N_VERSION) {
        clearI18nCaches();
        localStorage.setItem(VERSION_KEY, APP_I18N_VERSION);
      }
    } catch {}
  }, []);

  const [locale, setLocaleState] = useState<string>(initialLocale);
  const [languages, setLanguages] = useState<Language[]>([]);
  const cache = useRef(new Map<string, Messages>());
  const initialMessages = readStoredMessages(initialLocale) || {};
  const [messages, setMessages] = useState<Messages>(initialMessages);
  const [loading, setLoading] = useState<boolean>(false);
  const missingKeysRef = useRef<Set<string>>(new Set());
  const missingDebounceRef = useRef<number | null>(null);

  // 同一时刻仅处理最后一次加载结果
  const loadSeqRef = useRef(0);

  // 若本地有缓存，预先注入 cache 与 window，减少首屏闪烁
  useEffect(() => {
    if (Object.keys(initialMessages).length > 0) {
      cache.current.set(initialLocale, initialMessages);
      (window as any).spI18n = {
        t: mkT(initialMessages, initialLocale),
        locale: initialLocale,
        setLocale: (code: string) => applyLocale(code),
        messages: initialMessages,
        ensure,
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
    const mySeq = ++loadSeqRef.current;
    // 1) 内存缓存（忽略空对象）
    if (cache.current.has(lng)) {
      const cached = cache.current.get(lng)!;
      if (cached && Object.keys(cached).length > 0) {
        if (mySeq !== loadSeqRef.current) return;
        setMessages(cached);
        (window as any).spI18n = {
          t: mkT(cached, lng),
          locale: lng,
          setLocale,
          messages: cached,
          ensure,
        };
        try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lng } })); } catch {}
        return;
      }
    }
    // 2) 本地存储缓存（忽略空对象 + TTL）
    const stored = readStoredMessages(lng);
    if (stored && Object.keys(stored).length > 0) {
      cache.current.set(lng, stored);
      if (mySeq !== loadSeqRef.current) return;
      setMessages(stored);
      (window as any).spI18n = {
        t: mkT(stored, lng),
        locale: lng,
        setLocale,
        messages: stored,
        ensure,
      };
      try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lng } })); } catch {}
      return;
    }

    // 3) 网络请求
    setLoading(true);
    try {
      const data = await fetchMessages(lng);
      if (mySeq !== loadSeqRef.current) return; // 仅应用最后一次
      cache.current.set(lng, data);
      setMessages(data);
      writeStoredMessages(lng, data);
      (window as any).spI18n = {
        t: mkT(data, lng),
        locale: lng,
        setLocale,
        messages: data,
        ensure,
      };
      try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lng } })); } catch {}
    } finally {
      setLoading(false);
    }
  }, [setLocale]);

  // 按命名空间增量加载与合并（合并后写回缓存并广播）
  const ensure = useCallback(async (ns: string[]) => {
    const lng = locale;
    if (!Array.isArray(ns) || ns.length === 0) return;
    const data = await fetchMessages(lng, ns).catch(() => ({}));
    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      setMessages(prev => {
        const merged = { ...prev, ...data } as Messages;
        cache.current.set(lng, merged);
        writeStoredMessages(lng, merged);
        (window as any).spI18n = { t: mkT(merged, lng), locale: lng, setLocale, messages: merged, ensure };
        try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lng } })); } catch {}
        return merged;
      });
    }
  }, [locale, setLocale]);

  // 切换语言后：加载完成再决定是否强制 remount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadMessages(locale).catch(() => {});
      if (cancelled) return;
      if (!isForceRemount()) return;
      try {
        const fromHash = typeof window !== 'undefined' && window.location.hash ? window.location.hash.replace(/^#/, '') : undefined;
        const currentPath = fromHash || (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
        window.dispatchEvent(new CustomEvent('sp-refresh-route', { detail: { path: currentPath } }));
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [locale, loadMessages]);

  // 维护 html 的 lang 与 dir 属性
  useEffect(() => {
    try {
      const el = document.documentElement;
      if (el) {
        el.setAttribute('lang', locale);
        el.setAttribute('dir', isRTL(locale) ? 'rtl' : 'ltr');
      }
    } catch {}
    // 同步 dayjs locale（动态按需加载）
    (async () => {
      try {
        const dlc = mapDayjsLocale(locale);
        await import(/* @vite-ignore */ `dayjs/locale/${dlc}.js`);
        dayjs.locale(dlc as any);
      } catch {}
    })();
  }, [locale]);

  // 简单占位符插值：将 {name} 替换为 params.name
  const interpolate = (tpl: string, params?: Record<string, any>) =>
    params ? tpl.replace(/\{(\w+)\}/g, (_: any, k: string) => (params[k] !== undefined ? String(params[k]) : `{${k}}`)) : tpl;

  // 基于给定 messages 与语言生成 t 函数（不包含缺失上报，由 Provider 的 t 负责）
  const mkT = (msgs: Messages, lng: string): I18nContextValue['t'] =>
    (key, fallbackOrParams, maybeParams) => {
      let params: Record<string, any> | undefined;
      let fallback: string | undefined;
      if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
      else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams as any;
      if (maybeParams && typeof maybeParams === 'object') params = maybeParams as any;
      const raw = msgs[key] ?? (lng === 'zh-CN' ? (fallback ?? key) : key);
      return interpolate(raw, params);
    };

  const t = useCallback<I18nContextValue['t']>((key, fallbackOrParams, maybeParams) => {
    let params: Record<string, any> | undefined;
    let fallback: string | undefined;
    if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
    else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams as any;
    if (maybeParams && typeof maybeParams === 'object') params = maybeParams as any;

    const has = Object.prototype.hasOwnProperty.call(messages, key);
    const raw = (has ? messages[key] : (locale === 'zh-CN' ? (fallback ?? key) : key));

    if (!has && process.env.NODE_ENV !== 'production') {
      const mk = `${locale}::${key}`;
      if (!missingKeysRef.current.has(mk)) {
        missingKeysRef.current.add(mk);
        if (missingDebounceRef.current) window.clearTimeout(missingDebounceRef.current);
        missingDebounceRef.current = window.setTimeout(() => {
          const list = Array.from(missingKeysRef.current.values());
          if (list.length > 0) {
            try { console.warn(`[i18n] Missing keys(${locale}):`, list); } catch {}
            try { window.dispatchEvent(new CustomEvent('sp-i18n-missing-batch', { detail: { locale, keys: list } })); } catch {}
          }
        }, 1200);
      }
    }

    return interpolate(raw, params);
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
    (window as any).spI18n = { t: mkT(messages, locale), locale, setLocale, messages, ensure };
  }, [messages, locale, setLocale, ensure]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
};

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
