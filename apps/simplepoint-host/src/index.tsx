import React from 'react';
import '@simplepoint/libs-components/Simplepoint.css'
import ReactDOM from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19';
import App from '@/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@/i18n';
import { initMock } from './mock/init';

// 提前应用主题与语言到 <html>，减少首屏样式/文案跳变
(() => {
  try {
    const html = document.documentElement;
    // data-theme：基于 sp.theme 与系统偏好
    const themePref = localStorage.getItem('sp.theme') as 'light'|'dark'|'system' | null;
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = themePref === 'dark' ? 'dark' : themePref === 'system' ? (systemDark ? 'dark' : 'light') : 'light';
    html.setAttribute('data-theme', resolved);
    // lang/dir：基于 sp.locale
    const rawLocale = (localStorage.getItem('sp.locale') || 'zh-CN');
    const low = rawLocale.toLowerCase();
    html.setAttribute('lang', rawLocale);
    html.setAttribute('dir', /^(ar|he|fa|ur)(-|$)/i.test(low) ? 'rtl' : 'ltr');
  } catch {}
})();

function createRoot() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error('Root element not found');
  }
  const queryClient = new QueryClient();
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <App/>
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

// 统一由 initMock 控制是否启用 MSW：支持 dev 默认启用、URL/LocalStorage 开关、幂等与子路径
initMock()
  .catch(() => {/* 忽略 MSW 启动失败，继续渲染应用 */})
  .finally(() => {
    createRoot();
  });
