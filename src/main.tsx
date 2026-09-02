import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi.ts';
import { AuthProvider } from './context/AuthContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import App from './App.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
