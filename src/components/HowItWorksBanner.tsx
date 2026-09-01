import React from 'react';
import { Lock, PackageCheck, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';

export const HowItWorksBanner: React.FC = () => {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-xl">
      <div className="max-w-3xl mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
          <span>Trustless Peer-to-Peer Protocol</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          How Onchain Escrow Protects Both Parties
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Strangers can transact without trusting each other or relying on a centralized intermediary. The immutable smart contract acts as the referee.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 relative">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
            1
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" /> Buyer Locks Funds
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Buyer deposits ETH into the contract, designates the seller's wallet, and specifies a delivery deadline.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 relative">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">
            2
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-indigo-400" /> Seller Delivers
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seller verifies the funds are securely locked in the smart contract and proceeds to fulfill the delivery.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 relative">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
            3
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Buyer Releases
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Once satisfied, the buyer clicks release to instantly transfer 100% of the locked ETH to the seller.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5 relative">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs">
            4
          </div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Or Buyer Reclaims
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            If the seller fails to deliver before the deadline, the buyer can reclaim their full deposit onchain.
          </p>
        </div>
      </div>
    </div>
  );
};
