import { createConfig, http } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

const baseSepoliaRpcUrl = alchemyKey 
  ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`
  : 'https://sepolia.base.org';

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected({
      target: 'metaMask',
    }),
    injected(),
  ],
  transports: {
    [baseSepolia.id]: http(baseSepoliaRpcUrl),
    [base.id]: http(),
  },
  ssr: false,
});
