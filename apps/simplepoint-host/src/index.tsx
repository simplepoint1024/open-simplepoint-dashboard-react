import React from 'react';
import ReactDOM from 'react-dom/client';
import '@simplepoint/components/Simplepoint.css';
import '@ant-design/v5-patch-for-react-19';
import App from '@/App';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {applyInitialHtmlAttributes} from "@/utils/initHtmlAttributes.ts";
import {I18nProvider} from "@/layouts/i18n/I18nProvider.tsx";

applyInitialHtmlAttributes();

const queryClient = new QueryClient();

function createRoot() {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element not found');
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <App/>
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

// 在开发环境按需加载 mocks，避免生产环境打包任何 mock 相关代码
if (process.env.NODE_ENV === 'development') {
  // 动态导入，确保生产环境不会生成相关 chunk
  import('../../mocks')
    .then(() => createRoot())
    .catch((err) => {
      console.warn('MSW mock init failed:', err);
      createRoot();
    });
} else {
  createRoot();
}
