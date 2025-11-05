import React from 'react';
import ReactDOM from 'react-dom/client';
import '@simplepoint/libs-components/Simplepoint.css';
import '@ant-design/v5-patch-for-react-19';
import App from '@/App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nProvider } from '@/i18n';
import { initMock } from './mock/init';
import {applyInitialHtmlAttributes} from "@/utils/initHtmlAttributes.ts";

applyInitialHtmlAttributes();

const queryClient = new QueryClient();

function createRoot() {
  const rootEl = document.getElementById('root');
  if (!rootEl) throw new Error('Root element not found');
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

initMock()
  .catch((err) => console.warn('MSW mock init failed:', err))
  .finally(createRoot);
