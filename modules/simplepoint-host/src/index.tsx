import React from 'react';
import '@simplepoint/libs-components/Simplepoint.css'
import ReactDOM from 'react-dom/client';
import '@ant-design/v5-patch-for-react-19';
import App from '@/App';

function createRoot() {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    throw new Error('Root element not found');
  }
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App/>
    </React.StrictMode>,
  );
}

if (process.env.NODE_ENV === 'development') {
  import('../../../mocks').then(({worker}) => {
    worker.start({onUnhandledRequest: 'bypass'}).then(() => {
      createRoot();
    });
  });
} else {
  createRoot();
}

