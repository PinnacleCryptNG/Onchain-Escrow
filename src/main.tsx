import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { baseSepolia, base } from 'viem/chains';
import { config } from './wagmi.ts';
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

// Default Privy App ID for dev/testing, overridable by VITE_PRIVY_APP_ID or localStorage
const savedPrivyAppId = typeof window !== 'undefined' ? localStorage.getItem('onchain_escrow_privy_app_id') : null;
const PRIVY_APP_ID = savedPrivyAppId || import.meta.env.VITE_PRIVY_APP_ID || 'clp4k9y120000109g3j2h9m8a';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#3B82F6',
          showWalletLoginFirst: false,
          walletList: [
            'detected_wallets',
            'metamask',
            'coinbase_wallet',
            'rainbow',
            'phantom',
            'rabby_wallet',
            'wallet_connect',
          ],
        },
        loginMethods: ['email', 'wallet', 'google', 'twitter', 'github', 'discord', 'sms', 'farcaster'],
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
        defaultChain: baseSepolia,
        supportedChains: [baseSepolia, base],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </StrictMode>,
);
