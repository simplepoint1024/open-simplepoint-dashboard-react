import React from "react";
import { useI18n } from '@/i18n';

export const Settings: React.FC = () => {
  const { t } = useI18n();
  return (<h1>{t('menu.settings','Settings')}</h1>)
}