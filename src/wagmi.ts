import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c4f79cc821944d9680842e34466bfbd';
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const baseSepoliaRpcUrl = alchemyKey 
  ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : 'https://sepolia.base.org';

export const config = getDefaultConfig({
  appName: 'Onchain Escrow',
  projectId: projectId,
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http(baseSepoliaRpcUrl),
    [base.id]: http(),
  },
  ssr: false,
});
