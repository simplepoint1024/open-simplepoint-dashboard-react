import {useCallback, useEffect, useMemo, useState} from 'react';

export type Messages = Record<string, string>;

export type I18nLike = {
  t: (key: string, fallbackOrParams?: string | Record<string, any>, maybeParams?: Record<string, any>) => string;
  locale: string;
  setLocale: (code: string) => void;
  messages: Messages;
  ensure: (ns: string[]) => Promise<void> | void;
};

const interpolate = (tpl: string, params?: Record<string, any>) =>
  params ? tpl.replace(/\{(\w+)}/g, (_: any, k: string) => (params[k] !== undefined ? String(params[k]) : `{${k}}`)) : tpl;

export const mkT = (messages: Messages): I18nLike['t'] => (key, fallbackOrParams, maybeParams) => {
  let params: Record<string, any> | undefined;
  let fallback: string | undefined;
  if (typeof fallbackOrParams === 'string') fallback = fallbackOrParams;
  else if (fallbackOrParams && typeof fallbackOrParams === 'object') params = fallbackOrParams as any;
  if (maybeParams && typeof maybeParams === 'object') params = maybeParams as any;
  const raw = messages[key] ?? (fallback ?? key);
  return interpolate(raw, params);
};

function getGlobal(): I18nLike | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as any).spI18n as I18nLike | undefined;
}

export function useI18n() {
  const global = getGlobal();
  const [locale, setLocaleState] = useState<string>(global?.locale || 'zh-CN');
  const [messages, setMessages] = useState<Messages>(global?.messages || {});

  const t = useMemo(() => (global?.t ? global.t : mkT(messages)), [global?.t, messages]);

  const setLocale = useCallback((code: string) => {
    if (getGlobal()?.setLocale) getGlobal()!.setLocale(code);
    else setLocaleState(code);
  }, []);

  const ensure = useCallback(async (ns: string[]) => {
    const g = getGlobal();
    if (g && typeof g.ensure === 'function') {
      await g.ensure(ns);
    }
  }, []);

  useEffect(() => {
    const onUpdated = () => {
      const g = getGlobal();
      if (!g) return;
      setLocaleState(g.locale);
      setMessages(g.messages || {});
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('sp-i18n-updated', onUpdated as EventListener);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('sp-i18n-updated', onUpdated as EventListener);
      }
    };
  }, []);

  return {
    t,
    locale,
    setLocale,
    messages,
    ensure,
    ready: Object.keys(messages || {}).length > 0,
  } as const;
}

