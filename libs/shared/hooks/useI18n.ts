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

export function useI18n() {
  const globalRef = useMemo(() => getGlobal(), []);
  const [locale, setLocaleState] = useState<string>(globalRef?.locale || 'zh-CN');
  const [messages, setMessages] = useState<Messages>(globalRef?.messages || {});

  const t = useMemo(() => globalRef?.t ?? mkT(messages), [globalRef?.t, messages]);

  const setLocale = useCallback((code: string) => {
    try {
      globalRef?.setLocale?.(code);
    } catch {
      setLocaleState(code);
    }
  }, [globalRef]);

  const ensure = useCallback(async (ns: string[]) => {
    try {
      await globalRef?.ensure?.(ns);
    } catch {
      // silent fail or log
    }
  }, [globalRef]);

  useEffect(() => {
    if (!isBrowser) return;

    const onUpdated = () => {
      const g = getGlobal();
      if (!g) return;
      setLocaleState(g.locale);
      setMessages(g.messages || {});
    };

    window.addEventListener('sp-i18n-updated', onUpdated);
    return () => {
      window.removeEventListener('sp-i18n-updated', onUpdated);
    };
  }, []);

  return {
    t,
    locale,
    setLocale,
    messages,
    ensure,
    ready: Object.keys(messages).length > 0,
  } as const;
}
