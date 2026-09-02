import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Shield,
  User,
  ShoppingBag,
} from 'lucide-react';
import { DealDisplay, DealStatus } from '../types.ts';
import { getExplorerAddressUrl, truncateAddress } from '../contract/config.ts';

interface DealCardProps {
  deal: DealDisplay;
  userAddress?: string;
  onRelease: (dealId: number) => void;
  onReclaim: (dealId: number) => void;
  isActionLoading?: boolean;
}

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  userAddress,
  onRelease,
  onReclaim,
  isActionLoading = false,
}) => {
  const [copiedBuyer, setCopiedBuyer] = useState(false);
  const [copiedSeller, setCopiedSeller] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [isCurrentlyExpired, setIsCurrentlyExpired] = useState(deal.isExpired);
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);
  const [showConfirmReclaim, setShowConfirmReclaim] = useState(false);

  // Live countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = deal.deadlineTimestamp - now;

      if (diff <= 0) {
        setTimeLeftStr('Deadline passed');
        setIsCurrentlyExpired(true);
      } else {
        setIsCurrentlyExpired(false);
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        if (days > 0) {
          setTimeLeftStr(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeftStr(`${minutes}m ${seconds}s`);
        }
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [deal.deadlineTimestamp]);

  const copyAddress = (address: string, isBuyer: boolean) => {
    navigator.clipboard.writeText(address);
    if (isBuyer) {
      setCopiedBuyer(true);
      setTimeout(() => setCopiedBuyer(false), 2000);
    } else {
      setCopiedSeller(true);
      setTimeout(() => setCopiedSeller(false), 2000);
    }
  };

  const isBuyer = deal.role === 'buyer';
  const isSeller = deal.role === 'seller';
  const isActive = deal.status === DealStatus.Active;
  const isReleased = deal.status === DealStatus.Released;
  const isReclaimed = deal.status === DealStatus.Reclaimed;

  const canRelease = isActive && isBuyer;
  const canReclaim = isActive && isBuyer && isCurrentlyExpired;

  return (
    <div className="relative rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all p-5 sm:p-6 flex flex-col justify-between">
      {/* Top Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-xs font-semibold border border-slate-700/80">
              #{deal.id}
            </span>
            {/* Role indicator */}
            {isBuyer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <User className="w-3 h-3" /> Buyer
              </span>
            )}
            {isSeller && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <ShoppingBag className="w-3 h-3" /> Seller
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div>
            {isActive && !isCurrentlyExpired && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            )}
            {isActive && isCurrentlyExpired && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-3 h-3" />
                Deadline Reached
              </span>
            )}
            {isReleased && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Released
              </span>
            )}
            {isReclaimed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <RotateCcw className="w-3 h-3" />
                Refunded
              </span>
            )}
          </div>
        </div>

        {/* Deal Title & Amount */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-white tracking-tight leading-snug line-clamp-2">
            {deal.title}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-bold text-white font-mono tracking-tight">
              {deal.amountEth} <span className="text-sm font-sans font-normal text-slate-400">ETH</span>
            </span>
          </div>
        </div>

        {/* Counterparty Address Matrix */}
        <div className="space-y-2 p-3 rounded-xl bg-[#090d16]/70 border border-slate-800 text-xs mb-4">
          {/* Buyer */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Buyer:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <a
                href={getExplorerAddressUrl(deal.buyer)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors"
                title="View on Basescan"
              >
                {truncateAddress(deal.buyer, 6, 4)}
              </a>
              <button
                onClick={() => copyAddress(deal.buyer, true)}
                className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                title="Copy address"
              >
                {copiedBuyer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
              Seller:
            </span>
            <div className="flex items-center gap-1.5 font-mono text-slate-300">
              <a
                href={getExplorerAddressUrl(deal.seller)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
                title="View on Basescan"
              >
                {truncateAddress(deal.seller, 6, 4)}
              </a>
              <button
                onClick={() => copyAddress(deal.seller, false)}
                className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer"
                title="Copy address"
              >
                {copiedSeller ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </div>

        {/* Deadline & Created At */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
          <div className="p-2.5 rounded-xl bg-[#090d16]/50 border border-slate-800/80">
            <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              Created
            </span>
            <span className="text-slate-300">{deal.createdAtFormatted.split(',')[0]}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090d16]/50 border border-slate-800/80">
            <span className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
              {isActive ? 'Deadline' : 'Settlement'}
            </span>
            <span className={`font-medium ${isCurrentlyExpired && isActive ? 'text-amber-400' : 'text-slate-300'}`}>
              {isActive ? timeLeftStr : deal.deadlineFormatted.split(',')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="pt-3 border-t border-slate-800/80">
        {isActive ? (
          <div className="space-y-2">
            {isBuyer ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {/* Release Button */}
                  <button
                    onClick={() => setShowConfirmRelease(true)}
                    disabled={isActionLoading}
                    className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Release</span>
                  </button>

                  {/* Reclaim Button */}
                  <button
                    onClick={() => setShowConfirmReclaim(true)}
                    disabled={!canReclaim || isActionLoading}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                      canReclaim
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25 cursor-pointer'
                        : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isCurrentlyExpired ? 'Refund' : 'Refund (Locked)'}</span>
                  </button>
                </div>
              </>
            ) : isSeller ? (
              <div className="p-2.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-center">
                <p className="text-xs text-purple-300 font-medium">
                  Deliver to buyer to receive payment release.
                </p>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                <p className="text-[11px] text-slate-400">
                  Buyer: {truncateAddress(deal.buyer, 4, 3)}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Settled State Notice */
          <div className="text-center py-0.5">
            <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>
                {isReleased ? 'Settled: Transferred to seller' : 'Settled: Refunded to buyer'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Release Confirmation Prompt Modal (Portalled) */}
      {showConfirmRelease &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Release Payment</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Release <strong className="text-white font-mono">{deal.amountEth} ETH</strong> to the seller ({truncateAddress(deal.seller)})? This immediately completes the deal.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmRelease(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmRelease(false);
                    onRelease(deal.id);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl cursor-pointer"
                >
                  Confirm Release
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Reclaim Confirmation Prompt Modal (Portalled) */}
      {showConfirmReclaim &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2.5 text-rose-400">
                <RotateCcw className="w-5 h-5" />
                <h4 className="text-sm font-bold text-white">Reclaim Deposit</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                The deadline has elapsed. Reclaim your <strong className="text-white font-mono">{deal.amountEth} ETH</strong> deposit back to your wallet?
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmReclaim(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmReclaim(false);
                    onReclaim(deal.id);
                  }}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer"
                >
                  Confirm Refund
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

