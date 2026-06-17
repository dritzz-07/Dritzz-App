import {StrictMode, Component, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

class GlobalErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if ((this as any).state.hasError) {
      return (
        <div style={{ backgroundColor: 'black', color: 'red', padding: '20px', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Global React Crash</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{(this as any).state.error?.message}{'\n'}{(this as any).state.error?.stack}</pre>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

// main.tsx
console.log('Dritzz App: Script Loaded');

function initApp() {
  const rootElement = document.getElementById('root');
  console.log('Dritzz App: Finding root element...', { found: !!rootElement });

  if (rootElement) {
    try {
      console.log('Dritzz App: Creating React root...');
      const root = createRoot(rootElement);
      console.log('Dritzz App: Rendering components...');
      root.render(
        <StrictMode>
          <GlobalErrorBoundary>
            <AuthProvider>
              <LanguageProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </LanguageProvider>
            </AuthProvider>
          </GlobalErrorBoundary>
        </StrictMode>,
      );
      console.log('Dritzz App: Render initiated successfully.');
    } catch (error) {
      console.error('Dritzz App: Runtime error during mounting:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      rootElement.innerHTML = `<div style="padding: 20px; color: white; background: #900; font-family: sans-serif;">
        <h3>Application Error</h3>
        <p>${errorMsg}</p>
        <button onclick="window.location.reload()" style="background: white; color: black; border: none; padding: 10px 20px; cursor: pointer;">Reload</button>
      </div>`;
    }
  } else {
    console.warn('Dritzz App: Root element (#root) not found.');
  }
}

// Support both immediate and deferred execution
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global error catcher
window.onerror = function(msg, url, line, col, error) {
  console.error('Dritzz App: Global Error:', { msg, url, line, col, error });
  return false;
};

