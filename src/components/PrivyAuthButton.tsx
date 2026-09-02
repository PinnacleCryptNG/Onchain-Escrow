import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import { LogIn, User, ChevronDown, Shield, Sparkles } from 'lucide-react';
import { truncateAddress } from '../contract/config.ts';
import { PrivyUserModal } from './PrivyUserModal.tsx';

export const PrivyAuthButton: React.FC = () => {
  const { ready, authenticated, user, login } = usePrivy();
  const { address: wagmiAddress, isConnected } = useAccount();
  const { wallets } = useWallets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!ready) {
    return (
      <div className="h-10 px-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 text-xs text-slate-400 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-slate-700 animate-ping" />
        <span>Loading Auth...</span>
      </div>
    );
  }

  if (!authenticated || !user) {
    return (
      <button
        onClick={() => login()}
        className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 border border-indigo-400/30 transition-all hover:scale-[1.02] flex items-center gap-2 group"
      >
        <div className="w-4 h-4 rounded-md bg-white/20 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span>Log In with Privy</span>
        <span className="hidden sm:inline-block text-[10px] opacity-80 font-normal">
          (Email, Socials, or Wallet)
        </span>
      </button>
    );
  }

  // Active address resolution
  const activeWallet = wallets.find((w) => w.address.toLowerCase() === wagmiAddress?.toLowerCase()) || wallets[0];
  const walletAddress = activeWallet?.address || user.wallet?.address || wagmiAddress || '';
  const isEmbedded = activeWallet?.walletClientType === 'privy' || user.wallet?.walletClientType === 'privy';

  // Primary label
  const label =
    user.email?.address ||
    user.google?.email ||
    (user.twitter?.username ? `@${user.twitter.username}` : null) ||
    (walletAddress ? truncateAddress(walletAddress, 6, 4) : 'Connected');

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="h-10 pl-2.5 pr-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-medium transition-all flex items-center gap-2.5 shadow-sm group"
      >
        {/* User Identity Avatar */}
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
            {user.google ? (
              <span className="text-[10px] font-bold text-red-400">G</span>
            ) : user.email ? (
              <span className="text-[10px] font-bold text-blue-400">@</span>
            ) : (
              <User className="w-3 h-3 text-blue-400" />
            )}
          </div>
        </div>

        {/* Display Text & Badge */}
        <div className="flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-200 tracking-tight group-hover:text-white max-w-[130px] sm:max-w-[170px] truncate">
            {label}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>{isEmbedded ? 'Privy Wallet' : 'Base Sepolia'}</span>
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors ml-1" />
      </button>

      <PrivyUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
