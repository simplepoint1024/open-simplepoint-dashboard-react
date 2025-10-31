import React from "react";
import {Button} from "antd";
import { useI18n } from '@/i18n';

export const Profile: React.FC = () => {
  const { t } = useI18n();
  return (<Button type='primary'>{t('menu.profile','Profile')}</Button>)
}