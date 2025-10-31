import React from 'react';
import { useI18n } from '@/i18n';

export type I18nTextProps = {
  k: string;
  fallback?: string;
  params?: Record<string, any>;
};

const I18nText: React.FC<I18nTextProps> = ({ k, fallback, params }) => {
  const { t } = useI18n();
  return <>{t(k, fallback ?? k, params)}</>;
};

export default I18nText;

