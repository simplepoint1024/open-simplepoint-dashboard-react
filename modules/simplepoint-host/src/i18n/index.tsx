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
  try {
    const v = localStorage.getItem('sp.i18n.forceRemount');
    return v == null ? FORCE_REMOUNT_ON_LOCALE_CHANGE : v === 'true';
  } catch {}
  return FORCE_REMOUNT_ON_LOCALE_CHANGE;
};

const isRTL = (lng: string) => /^(ar|he|fa|ur)(-|$)/i.test(lng);

const mapDayjsLocale = (lng: string) => {
  const raw = (lng || 'en-US').toLowerCase();
  const [lang, region] = raw.split(/[-_]/);
  const key = region ? `${lang}-${region}` : lang;
  const overrides: Record<string, string> = {
    'zh-cn': 'zh-cn',
    'zh-tw': 'zh-tw',
    'en-gb': 'en-gb',
    'pt-br': 'pt-br',
  };
  return overrides[key] || lang || 'en';
};

// 规范化语言码（表驱动 + 通用规则）：en -> en-US, ja -> ja-JP, zh -> zh-CN，其它按语言-地区格式规范
const normalizeLocale = (code?: string): string => {
  const raw = (code || '').trim();
  if (!raw) return 'zh-CN';
  const map: Record<string, string> = { en: 'en-US', 'en-us': 'en-US', ja: 'ja-JP', 'ja-jp': 'ja-JP', zh: 'zh-CN', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW' };
  const low = raw.toLowerCase();
  if (map[low]) return map[low];
  // 通用：lang[-region] -> ll-CC
  const m = low.split(/[-_]/);
  const lang = (m[0] || 'en').toLowerCase();
  const region = (m[1] || '').toUpperCase();
  return region ? `${lang}-${region}` : (lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : lang === 'en' ? 'en-US' : `${lang}-US`);
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
    try { return normalizeLocale(localStorage.getItem('sp.locale') || undefined); } catch { return 'zh-CN'; }
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

  // 批量 ensure 队列与状态
  const loadedNsRef = useRef<Set<string>>(new Set());
  const ensurePendingNsRef = useRef<Set<string>>(new Set());
  const ensureTimerRef = useRef<number | null>(null);
  const ensureWaitersRef = useRef<Array<() => void>>([]);
  const ensureInflightRef = useRef<Promise<void> | null>(null);

  // 同一时刻仅处理最后一次加载结果
  const loadSeqRef = useRef(0);

  // 若本地有缓存，预先注入 cache 与 window，减少首屏闪烁
  useEffect(() => {
    if (Object.keys(initialMessages).length > 0) {
      cache.current.set(initialLocale, initialMessages);
      (window as any).spI18n = {
        t: mkT(initialMessages),
        locale: initialLocale,
        setLocale: (code: string) => applyLocale(code),
        messages: initialMessages,
        ensure,
      };
    }
  }, []);

  const applyLocale = useCallback((code: string) => {
    const norm = normalizeLocale(code);
    try { localStorage.setItem('sp.locale', norm); } catch {}
    setLocaleState(norm);
    try { window.dispatchEvent(new CustomEvent('sp-set-locale', { detail: norm })); } catch {}
  }, []);

  // expose setter that also persists and emits event
  const setLocale = useCallback((code: string) => { applyLocale(code); }, [applyLocale]);

  // listen external locale changes (e.g., from other micro apps)
  useEffect(() => {
    const handler = (e: any) => {
      const next = normalizeLocale((e?.detail as string) || 'zh-CN');
      if (next === locale) return; // 避免重复更新
      setLocaleState(next);
    };
    window.addEventListener('sp-set-locale', handler as EventListener);
    return () => window.removeEventListener('sp-set-locale', handler as EventListener);
  }, [locale]);

  // load languages once
  useEffect(() => {
    (async () => {
      const list = await fetchLanguages();
      setLanguages(list);
    })().catch(() => {});
  }, []);

  const loadMessages = useCallback(async (lng: string) => {
    const lang = normalizeLocale(lng);
    const mySeq = ++loadSeqRef.current;
    // 1) 内存缓存（忽略空对象）
    if (cache.current.has(lang)) {
      const cached = cache.current.get(lang)!;
      if (cached && Object.keys(cached).length > 0) {
        if (mySeq !== loadSeqRef.current) return;
        setMessages(cached);
        (window as any).spI18n = { t: mkT(cached), locale: lang, setLocale, messages: cached, ensure };
        try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lang } })); } catch {}
        return;
      }
    }
    // 2) 本地存储缓存（忽略空对象 + TTL）
    const stored = readStoredMessages(lang);
    if (stored && Object.keys(stored).length > 0) {
      cache.current.set(lang, stored);
      if (mySeq !== loadSeqRef.current) return;
      setMessages(stored);
      (window as any).spI18n = { t: mkT(stored), locale: lang, setLocale, messages: stored, ensure };
      try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lang } })); } catch {}
      return;
    }

    // 3) 网络请求
    setLoading(true);
    try {
      const data = await fetchMessages(lang);
      if (mySeq !== loadSeqRef.current) return; // 仅应用最后一次
      cache.current.set(lang, data);
      setMessages(data);
      writeStoredMessages(lang, data);
      (window as any).spI18n = { t: mkT(data), locale: lang, setLocale, messages: data, ensure };
      try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lang } })); } catch {}
      // 切换语言后重置已加载命名空间记录
      loadedNsRef.current.clear();
    } finally {
      setLoading(false);
    }
  }, [setLocale]);

  // 按命名空间增量加载与合并（合并后写回缓存并广播）
  const ensure = useCallback(async (ns: string[]) => {
    if (!Array.isArray(ns) || ns.length === 0) return;
    // 加入待加载队列（去重 + 过滤已加载）
    const already = loadedNsRef.current;
    ns.forEach(k => { if (k && !already.has(k)) ensurePendingNsRef.current.add(k); });

    // 返回一个在本批 flush 完成后 resolve 的 Promise（调用方多为 fire-and-forget）
    const p = new Promise<void>(resolve => { ensureWaitersRef.current.push(resolve); });

    const flush = async () => {
      if (ensureInflightRef.current) return; // 有进行中的请求，等待下一轮
      const list = Array.from(ensurePendingNsRef.current.values());
      if (list.length === 0) return;
      ensurePendingNsRef.current.clear();
      const lng = locale;
      ensureInflightRef.current = fetchMessages(lng, list)
        .then((data) => {
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setMessages(prev => {
              const merged = { ...prev, ...data } as Messages;
              cache.current.set(lng, merged);
              writeStoredMessages(lng, merged);
              (window as any).spI18n = { t: mkT(merged), locale: lng, setLocale, messages: merged, ensure };
              try { window.dispatchEvent(new CustomEvent('sp-i18n-updated', { detail: { locale: lng } })); } catch {}
              return merged;
            });
            list.forEach(k => loadedNsRef.current.add(k));
          }
        })
        .catch(() => {})
        .finally(() => {
          ensureInflightRef.current = null;
          // 本轮所有等待者统一 resolve
          const waiters = ensureWaitersRef.current.splice(0, ensureWaitersRef.current.length);
          waiters.forEach(fn => { try { fn(); } catch {} });
          // 若在请求过程中又加入了新 ns，短延迟继续下一轮
          if (ensurePendingNsRef.current.size > 0) {
            if (ensureTimerRef.current) window.clearTimeout(ensureTimerRef.current);
            ensureTimerRef.current = window.setTimeout(() => { ensureTimerRef.current = null; void flush(); }, 30);
          }
        });
      await ensureInflightRef.current;
    };

    // 轻微防抖，合并相近时刻的多次调用
    if (ensureTimerRef.current) window.clearTimeout(ensureTimerRef.current);
    ensureTimerRef.current = window.setTimeout(() => { ensureTimerRef.current = null; void flush(); }, 30);

    return p;
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
    return () => { cancelled = true; ensurePendingNsRef.current.clear(); if (ensureTimerRef.current) { window.clearTimeout(ensureTimerRef.current); ensureTimerRef.current = null; } };
  }, [locale, loadMessages]);

  // 维护 html 的 lang 与 dir 属性 + 同步 dayjs locale
  useEffect(() => {
    try {
      const el = document.documentElement;
      if (el) { el.setAttribute('lang', locale); el.setAttribute('dir', isRTL(locale) ? 'rtl' : 'ltr'); }
    } catch {}
    (async () => {
      try { const dlc = mapDayjsLocale(locale); await import(/* @vite-ignore */ `dayjs/locale/${dlc}.js`); dayjs.locale(dlc as any); } catch {}
    })();
  }, [locale]);

  // 简单占位符插值：将 {name} 替换为 params.name
  const interpolate = (tpl: string, params?: Record<string, any>) =>
    params ? tpl.replace(/{(\w+)}/g, (_: any, k: string) => (params[k] !== undefined ? String(params[k]) : `{${k}}`)) : tpl;

  // 基于给定 messages 生成 t 函数（统一 fallback，不区分语言）
  const mkT = (msgs: Messages): I18nContextValue['t'] =>
    (key, fallbackOrParams, maybeParams) => {
      let params: Record<string, any> | undefined;
      let fallback: string | undefined;
      if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
      else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams as any;
      if (maybeParams && typeof maybeParams === 'object') params = maybeParams as any;
      const raw = msgs[key] ?? (fallback ?? key);
      return interpolate(raw, params);
    };

  const t = useCallback<I18nContextValue['t']>((key, fallbackOrParams, maybeParams) => {
    let params: Record<string, any> | undefined;
    let fallback: string | undefined;
    if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
    else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams as any;
    if (maybeParams && typeof maybeParams === 'object') params = maybeParams as any;

    const has = Object.prototype.hasOwnProperty.call(messages, key);
    const raw = has ? messages[key] : (fallback ?? key);

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
    (window as any).spI18n = { t: mkT(messages), locale, setLocale, messages, ensure };
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
