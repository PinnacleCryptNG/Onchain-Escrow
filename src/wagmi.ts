import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';

const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const baseSepoliaRpcUrl = alchemyKey 
  ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : 'https://sepolia.base.org';

export const config = createConfig({
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http(baseSepoliaRpcUrl),
    [base.id]: http(),
  },
  ssr: false,
});
