import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Loader2, X, ArrowUpRight } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!txState.isOpen || !mounted) return null;

  const isSigning = txState.step === 'signing';
  const isMining = txState.step === 'mining';
  const isSuccess = txState.step === 'success';
  const isError = txState.step === 'error';

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button (only when finished or errored) */}
        {(isSuccess || isError) && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content Body */}
        <div className="text-center py-2 space-y-4">
          {/* Status Icon */}
          <div className="flex justify-center">
            {isSigning && (
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {isMining && (
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
              </div>
            )}
            {isSuccess && (
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            {isError && (
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Heading */}
          <div>
            <h3 className="text-base font-bold text-white tracking-tight font-display">
              {isSigning && 'Sign in Wallet'}
              {isMining && 'Confirming on Base'}
              {isSuccess && 'Transaction Confirmed'}
              {isError && 'Transaction Failed'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isSigning && 'Please approve the transaction prompt in your wallet.'}
              {isMining && 'Waiting for block confirmation...'}
              {isSuccess && 'Escrow state updated successfully.'}
              {isError && (txState.errorMessage || 'An error occurred during execution.')}
            </p>
          </div>

          {/* Transaction Hash link */}
          {txState.txHash && (
            <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] mb-0.5">Transaction Hash</span>
              <a
                href={getExplorerTxUrl(txState.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
              >
                <span>{txState.txHash.slice(0, 8)}...{txState.txHash.slice(-6)}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-1">
            {isSuccess && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                Done
              </button>
            )}
            {isError && (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

