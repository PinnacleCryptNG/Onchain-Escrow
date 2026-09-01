import { baseSepolia } from 'viem/chains';

// Default deployed address on Base Sepolia testnet
// (Users can also customize or connect to their own deployment in the UI)
export const DEFAULT_ESCROW_CONTRACT_ADDRESS = 
  (import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS as `0x${string}`) || 
  '0x9A48F9E8cD6F27a8B8b9c8B72e12B4c6198C51E2';

export const BASE_SEPOLIA_CHAIN = baseSepolia;

export const BASESCAN_SEPOLIA_URL = 'https://sepolia.basescan.org';

export function getExplorerTxUrl(txHash: string): string {
  return `${BASESCAN_SEPOLIA_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${BASESCAN_SEPOLIA_URL}/address/${address}`;
}

export function truncateAddress(address?: string, startLength = 6, endLength = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}
