import React from 'react';
import { Lock, Package, CheckCircle2, RotateCcw } from 'lucide-react';

export const HowItWorksBanner: React.FC = () => {
  return (
    <div className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          How Onchain Escrow Works
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          A simple, secure process that guarantees payment safety for both buyers and sellers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Step 1 */}
        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 font-mono">Step 1</span>
            <Lock className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Deposit & Lock</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Buyer deposits ETH into smart contract escrow, specifies seller's wallet, and sets a delivery deadline.
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 font-mono">Step 2</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Seller Delivers</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Seller verifies funds are safely locked onchain and fulfills the order or service with peace of mind.
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 font-mono">Step 3</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Release Payment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upon receipt and satisfaction, buyer clicks release to instantly transfer 100% of the funds to the seller.
          </p>
        </div>

        {/* Step 4 */}
        <div className="p-4 rounded-xl bg-[#090d16]/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-400 font-mono">Step 4</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">Refund Protection</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            If the deadline passes and goods are not delivered, buyer reclaims their full deposit back onchain.
          </p>
        </div>
      </div>
    </div>
  );
};

