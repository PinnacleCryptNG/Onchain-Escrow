export enum DealStatus {
  Active = 0,
  Released = 1,
  Reclaimed = 2,
}

export interface DealData {
  id: bigint;
  buyer: `0x${string}`;
  seller: `0x${string}`;
  amount: bigint; // in wei
  deadline: bigint; // in seconds (unix timestamp)
  status: DealStatus;
  title: string;
  createdAt: bigint;
}

export interface DealDisplay {
  id: number;
  buyer: string;
  seller: string;
  amountEth: string;
  amountWei: bigint;
  deadlineTimestamp: number;
  deadlineFormatted: string;
  isExpired: boolean;
  status: DealStatus;
  statusLabel: 'Active' | 'Released' | 'Reclaimed' | 'Expired (Ready to Reclaim)';
  title: string;
  createdAt: number;
  createdAtFormatted: string;
  role: 'buyer' | 'seller' | 'viewer';
}

export type DealFilterTab = 'all' | 'as_buyer' | 'as_seller' | 'active' | 'completed';

export interface TxFeedbackState {
  isOpen: boolean;
  type: 'create' | 'release' | 'reclaim' | 'idle';
  step: 'preparing' | 'signing' | 'mining' | 'success' | 'error';
  txHash?: `0x${string}`;
  dealId?: number;
  errorMessage?: string;
  title?: string;
}
