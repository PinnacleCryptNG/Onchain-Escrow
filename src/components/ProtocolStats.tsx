import React from 'react';
import { Lock, CheckCircle2, FileText, Zap } from 'lucide-react';
import { DealDisplay, DealStatus } from '../types.ts';

interface ProtocolStatsProps {
  deals: DealDisplay[];
  contractBalanceEth: string;
  dealCount: number;
}

export const ProtocolStats: React.FC<ProtocolStatsProps> = ({
  deals,
  contractBalanceEth,
  dealCount,
}) => {
  const activeDeals = deals.filter((d) => d.status === DealStatus.Active);
  const completedDeals = deals.filter(
    (d) => d.status === DealStatus.Released || d.status === DealStatus.Reclaimed
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
      {/* Locked TVL */}
      <div className="p-3 sm:p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] sm:text-xs font-medium">Funds in Escrow</span>
          <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        </div>
        <div className="text-lg sm:text-2xl font-bold text-white font-mono tracking-tight truncate">
          {contractBalanceEth} <span className="text-xs sm:text-sm font-sans font-normal text-slate-400">ETH</span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Currently locked</p>
      </div>

      {/* Active Escrow Deals */}
      <div className="p-3 sm:p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] sm:text-xs font-medium">Active Deals</span>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0"></span>
        </div>
        <div className="text-lg sm:text-2xl font-bold text-white font-mono tracking-tight">
          {activeDeals.length}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">In progress</p>
      </div>

      {/* Total Settled Deals */}
      <div className="p-3 sm:p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] sm:text-xs font-medium">Total Deals</span>
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
        <div className="text-lg sm:text-2xl font-bold text-white font-mono tracking-tight">
          {dealCount}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">{completedDeals.length} settled</p>
      </div>

      {/* Protocol Fee */}
      <div className="p-3 sm:p-4.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 min-w-0">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] sm:text-xs font-medium">Protocol Fee</span>
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        </div>
        <div className="text-lg sm:text-2xl font-bold text-emerald-400 font-mono tracking-tight">
          0%
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Direct peer-to-peer</p>
      </div>
    </div>
  );
};
