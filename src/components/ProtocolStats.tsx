import React from 'react';
import { Layers, ShieldCheck, Activity, Users, Zap } from 'lucide-react';
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
  const releasedDeals = deals.filter((d) => d.status === DealStatus.Released);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Locked TVL */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Value Locked</span>
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
          {contractBalanceEth} ETH
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Currently in escrow custody</p>
      </div>

      {/* Active Escrow Deals */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Active Deals</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
          {activeDeals.length}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Awaiting delivery or deadline</p>
      </div>

      {/* Total Settled Deals */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Historical Deals</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight">
          {dealCount}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Created on Base Sepolia</p>
      </div>

      {/* Trustless Security */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Protocol Fee</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono tracking-tight">
          0.00%
        </div>
        <p className="text-[11px] text-slate-400 mt-1">100% peer-to-peer, no cuts</p>
      </div>
    </div>
  );
};
