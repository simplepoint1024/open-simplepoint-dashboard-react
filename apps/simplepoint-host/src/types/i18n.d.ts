import type { I18nContextValue } from '@/context/I18nProvider';

declare global {
  interface Window {
    spI18n?: I18nContextValue;
  }
}
