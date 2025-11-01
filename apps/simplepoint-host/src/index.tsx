import React from 'react';
import '@simplepoint/libs-components/Simplepoint.css'
import ReactDOM from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19';
import App from '@/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@/i18n';
import { initMock } from './mock/init';

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
