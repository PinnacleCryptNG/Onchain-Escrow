import React, { useState } from 'react';
import { Shield, Droplets, RefreshCw, SlidersHorizontal, Plus, Menu, X, ExternalLink } from 'lucide-react';
import { truncateAddress, DEFAULT_ESCROW_CONTRACT_ADDRESS } from '../contract/config.ts';
import { PrivyAuthButton } from './PrivyAuthButton.tsx';
import { useAppAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  contractAddress: string;
  contractBalanceEth: string;
  dealCount: number;
  onOpenContractSettings: () => void;
  onOpenCreateDeal: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onGoToLanding?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  contractAddress,
  contractBalanceEth,
  dealCount,
  onOpenContractSettings,
  onOpenCreateDeal,
  onRefresh,
  isRefreshing,
  onGoToLanding,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile } = useAppAuth();
  const isAuthenticated = profile.isAuthenticated && !!profile.address;

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#080b0f]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Home Navigation */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink">
            <button
              onClick={onGoToLanding}
              className="flex items-center gap-2 text-left cursor-pointer group"
              title="Return to Overview"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-950/40 shrink-0 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight truncate font-display group-hover:text-emerald-300 transition-colors">
                  <span className="hidden xs:inline">Onchain </span>Escrow
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Sepolia</span>
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Protocol Overview & Navigation */}
          <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            {onGoToLanding && (
              <>
                <button
                  onClick={onGoToLanding}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Overview
                </button>
                <span className="text-slate-700">|</span>
              </>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Locked:</span>
              <span className="font-mono font-semibold text-white">{contractBalanceEth} ETH</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Settled:</span>
              <span className="font-mono font-semibold text-white">{dealCount} deals</span>
            </div>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Create Deal Button (Only shown when authenticated) */}
            {isAuthenticated && (
              <button
                onClick={onOpenCreateDeal}
                className="h-8.5 sm:h-9.5 px-2.5 sm:px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Deal</span>
                <span className="sm:hidden text-[11px]">Deal</span>
              </button>
            )}

            {/* Faucet Link (Desktop only) */}
            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 h-9.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
              title="Get Base Sepolia Faucet ETH"
            >
              <Droplets className="w-3.5 h-3.5 text-teal-400" />
              <span>Faucet</span>
            </a>

            {/* Refresh Data (Desktop/Tablet) - ONLY available once a user logs in or connects wallet */}
            {isAuthenticated && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="hidden sm:flex w-9.5 h-9.5 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                title="Refresh deals"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}

            {/* Contract Settings (Desktop/Tablet) */}
            <button
              onClick={onOpenContractSettings}
              className="hidden sm:flex w-9.5 h-9.5 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer shrink-0"
              title="Contract settings"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* User Auth / Wallet Button */}
            <PrivyAuthButton />

            {/* Mobile More Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden w-8.5 h-8.5 flex items-center justify-center text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 cursor-pointer shrink-0"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Submenu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/80 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Refresh in mobile menu - only when authenticated */}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    onRefresh();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isRefreshing}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Refresh Deals</span>
                </button>
              ) : onGoToLanding ? (
                <button
                  onClick={() => {
                    onGoToLanding();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Overview</span>
                </button>
              ) : null}

              <button
                onClick={() => {
                  onOpenContractSettings();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 active:bg-slate-800 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Contract Info</span>
              </button>
            </div>

            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300"
            >
              <div className="flex items-center gap-2">
                <Droplets className="w-3.5 h-3.5 text-teal-400" />
                <span>Get Free Base Sepolia ETH</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
