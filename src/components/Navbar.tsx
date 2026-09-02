import React, { useState } from 'react';
import { Shield, Droplets, RefreshCw, SlidersHorizontal, Plus } from 'lucide-react';
import { truncateAddress } from '../contract/config.ts';
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
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          {/* Logo & Network */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight">Onchain Escrow</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span className="hidden xs:inline">Base</span> Sepolia
                </span>
              </div>
            </div>
          </div>

          {/* Center Protocol Quick Metric (Desktop only) */}
          <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Locked:</span>
              <span className="font-mono font-semibold text-white">{contractBalanceEth} ETH</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Settlements:</span>
              <span className="font-mono font-semibold text-white">{dealCount} deals</span>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Create Deal Quick Button for mobile & desktop */}
            <button
              onClick={onOpenCreateDeal}
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Deal</span>
              <span className="sm:hidden">Deal</span>
            </button>

            {/* Testnet ETH Link (Desktop) */}
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 h-10 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
              title="Get free Base Sepolia Testnet ETH"
            >
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span>Get Faucet ETH</span>
            </a>

            {/* Refresh Data Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh onchain state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Contract Config */}
            <button
              onClick={onOpenContractSettings}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl border border-slate-800 transition-colors cursor-pointer"
              title="Smart Contract Details"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* User Auth / Wallet Button */}
            <PrivyAuthButton />
          </div>
        </div>
      </div>
    </header>
  );
};

