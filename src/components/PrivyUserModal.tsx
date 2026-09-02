import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';
import {
  X,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Key,
  Plus,
  Mail,
  Wallet,
  Sparkles,
  Droplets,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { getExplorerAddressUrl, truncateAddress } from '../contract/config.ts';

interface PrivyUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivyUserModal: React.FC<PrivyUserModalProps> = ({ isOpen, onClose }) => {
  const { user, authenticated, logout, exportWallet, linkEmail, linkGoogle, linkWallet } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const { wallets } = useWallets();

  const [copied, setCopied] = useState(false);
  const [customAppId, setCustomAppId] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen || !authenticated || !user) return null;

  // Find active wallet address
  const activeWallet = wallets.find((w) => w.address.toLowerCase() === wagmiAddress?.toLowerCase()) || wallets[0];
  const walletAddress = activeWallet?.address || user.wallet?.address || wagmiAddress || '';
  const isEmbedded = activeWallet?.walletClientType === 'privy' || user.wallet?.walletClientType === 'privy';

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveCustomAppId = () => {
    if (customAppId.trim()) {
      localStorage.setItem('onchain_escrow_privy_app_id', customAppId.trim());
      window.location.reload();
    }
  };

  const handleResetAppId = () => {
    localStorage.removeItem('onchain_escrow_privy_app_id');
    window.location.reload();
  };

  // Extract linked identity info
  const email = user.email?.address;
  const google = user.google?.email;
  const twitter = user.twitter?.username;
  const discord = user.discord?.username;
  const github = user.github?.username;
  const farcaster = user.farcaster?.username;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Privy Account</h2>
              <p className="text-xs text-slate-400">Authenticated on Base Sepolia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Active Wallet Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-slate-300">Active Wallet</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isEmbedded
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}
              >
                {isEmbedded ? 'Privy Embedded Wallet' : activeWallet?.walletClientType || 'External Wallet'}
              </span>
            </div>

            {/* Address Display with Copy & Explorer */}
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
              <span className="font-mono text-xs text-slate-200 truncate">
                {walletAddress ? truncateAddress(walletAddress, 10, 8) : 'No address detected'}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Copy full address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {walletAddress && (
                  <a
                    href={getExplorerAddressUrl(walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition-colors"
                    title="View on Basescan Sepolia"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Wallet Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isEmbedded && (
                <button
                  onClick={() => exportWallet()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                  title="Export your embedded wallet private key for self-custody"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Private Key</span>
                </button>
              )}

              <a
                href="https://www.alchemy.com/faucets/base-sepolia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors"
              >
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                <span>Get Base Sepolia ETH</span>
                <ExternalLink className="w-3 h-3 text-blue-400/60" />
              </a>
            </div>
          </div>

          {/* Linked Identifiers / Socials */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Linked Accounts & Socials
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {email && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="truncate text-slate-300">{email}</span>
                </div>
              )}
              {google && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-red-400">G</span>
                  <span className="truncate text-slate-300">{google}</span>
                </div>
              )}
              {twitter && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-[10px] text-sky-400">𝕏</span>
                  <span className="truncate text-slate-300">@{twitter}</span>
                </div>
              )}
              {farcaster && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="truncate text-slate-300">FC: @{farcaster}</span>
                </div>
              )}
            </div>

            {/* Quick link account buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {!email && (
                <button
                  onClick={() => linkEmail()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3 text-blue-400" />
                  <span>Link Email</span>
                </button>
              )}
              {!google && (
                <button
                  onClick={() => linkGoogle()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
                >
                  <Plus className="w-3 h-3 text-red-400" />
                  <span>Link Google</span>
                </button>
              )}
              <button
                onClick={() => linkWallet()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>Link Another Wallet</span>
              </button>
            </div>
          </div>

          {/* Privy App ID Configuration Switcher */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Privy Project Config</span>
            </button>

            {showConfig && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-400">
                  Connect your custom Privy Dashboard App ID or use the default Base Sepolia configuration:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="clw..."
                    value={customAppId}
                    onChange={(e) => setCustomAppId(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSaveCustomAppId}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
                <button
                  onClick={handleResetAppId}
                  className="text-[11px] text-slate-500 hover:text-slate-400 underline"
                >
                  Reset to default App ID
                </button>
              </div>
            )}
          </div>

          {/* Log Out Action */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Session active with Privy</span>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
