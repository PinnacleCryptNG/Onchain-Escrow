import React, { useState } from 'react';
import { ShieldCheck, Layers, ExternalLink, Settings, Droplets, RefreshCw } from 'lucide-react';
import { getExplorerAddressUrl, truncateAddress } from '../contract/config.ts';
import { PrivyAuthButton } from './PrivyAuthButton.tsx';

interface NavbarProps {
  contractAddress: string;
  contractBalanceEth: string;
  dealCount: number;
  onOpenContractSettings: () => void;
  onOpenCreateDeal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  contractAddress,
  contractBalanceEth,
  dealCount,
  onOpenContractSettings,
  onOpenCreateDeal,
  onRefresh,
  isRefreshing,
}) => {
  const [copied, setCopied] = useState(false);

  const copyContractAddress = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 min-w-max">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">Onchain Escrow</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Base Sepolia
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal hidden sm:block">
                Trustless P2P settlement referee
              </p>
            </div>
          </div>

          {/* Center Protocol Health Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200">Contract:</span>
              <button
                onClick={copyContractAddress}
                className="font-mono text-blue-400 hover:text-blue-300 transition-colors"
                title="Click to copy contract address"
              >
                {truncateAddress(contractAddress, 6, 4)}
              </button>
              {copied && <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>}
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Locked: <strong className="text-white font-mono">{contractBalanceEth} ETH</strong></span>
            </div>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-1">
              <span>Total Deals: <strong className="text-white font-mono">{dealCount}</strong></span>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Quick Faucet Link */}
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="Get free Base Sepolia Testnet ETH"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Get Testnet ETH</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>

            {/* Refresh Data Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors disabled:opacity-50"
              title="Refresh deals onchain"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Contract Config */}
            <button
              onClick={onOpenContractSettings}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg border border-slate-800 transition-colors"
              title="Inspect or customize Escrow Contract"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Privy Auth / Wallet Button */}
            <PrivyAuthButton />
          </div>
        </div>
      </div>
    </header>
  );
};
