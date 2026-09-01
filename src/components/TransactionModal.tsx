import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink, X, Shield, ArrowUpRight } from 'lucide-react';
import { TxFeedbackState } from '../types.ts';
import { getExplorerTxUrl } from '../contract/config.ts';

interface TransactionModalProps {
  txState: TxFeedbackState;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  txState,
  onClose,
}) => {
  if (!txState.isOpen) return null;

  const isSigning = txState.step === 'signing';
  const isMining = txState.step === 'mining';
  const isSuccess = txState.step === 'success';
  const isError = txState.step === 'error';

  const getActionTitle = () => {
    switch (txState.type) {
      case 'create':
        return 'Creating Escrow Deal';
      case 'release':
        return `Releasing Funds (Deal #${txState.dealId})`;
      case 'reclaim':
        return `Reclaiming Funds (Deal #${txState.dealId})`;
      default:
        return 'Transaction in Progress';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        {/* Close button (only when finished or errored) */}
        {(isSuccess || isError) && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content Body */}
        <div className="text-center py-3 space-y-4">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSigning && (
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
            {isMining && (
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                </div>
              </div>
            )}
            {isSuccess && (
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
            )}
            {isError && (
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-8 h-8" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isSigning && 'Sign in Wallet'}
              {isMining && 'Mining on Base Sepolia'}
              {isSuccess && 'Transaction Confirmed!'}
              {isError && 'Transaction Reverted'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isSigning && 'Please approve the transaction in your connected wallet popup.'}
              {isMining && 'Waiting for Base Sepolia block confirmation...'}
              {isSuccess && 'State successfully updated onchain in the escrow contract.'}
              {isError && (txState.errorMessage || 'An error occurred during transaction execution.')}
            </p>
          </div>

          {/* Transaction Hash link */}
          {txState.txHash && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px] mb-1">Base Sepolia Tx Hash:</span>
              <a
                href={getExplorerTxUrl(txState.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-semibold break-all"
              >
                <span>{txState.txHash.slice(0, 16)}...{txState.txHash.slice(-14)}</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            {isSuccess && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
              >
                Done
              </button>
            )}
            {isError && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
