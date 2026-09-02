import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Copy, ExternalLink, ShieldCheck, Cpu } from 'lucide-react';
import { isAddress, getAddress } from 'viem';
import { getExplorerAddressUrl, truncateAddress, DEFAULT_ESCROW_CONTRACT_ADDRESS } from '../contract/config.ts';

interface ContractConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: string;
  onUpdateAddress: (address: `0x${string}`) => void;
}

export const ContractConfigModal: React.FC<ContractConfigModalProps> = ({
  isOpen,
  onClose,
  currentAddress,
  onUpdateAddress,
}) => {
  const [customInput, setCustomInput] = useState(currentAddress);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!isAddress(customInput.trim())) {
      setErrorMsg('Invalid Ethereum address format.');
      return;
    }
    const clean = getAddress(customInput.trim());
    onUpdateAddress(clean);
    onClose();
  };

  const handleResetDefault = () => {
    setCustomInput(DEFAULT_ESCROW_CONTRACT_ADDRESS);
    onUpdateAddress(DEFAULT_ESCROW_CONTRACT_ADDRESS);
    setErrorMsg(null);
  };

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-800/80 bg-[#090d16]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight font-display">Contract Settings</h2>
              <p className="text-[11px] text-slate-400">Base Sepolia escrow contract details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs text-slate-300">
          {/* Active Contract Info */}
          <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 text-xs">
                Active Contract
              </span>
              <a
                href={getExplorerAddressUrl(currentAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
              >
                <span>View on Basescan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0f172a] border border-slate-800">
              <span className="font-mono text-white text-xs break-all">{currentAddress}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                title="Copy address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Architecture & Security Guarantees */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Security Guarantee</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Every state change follows the Checks-Effects-Interactions pattern with reentrancy protection. Deposits are locked strictly until release or deadline expiration.
            </p>
          </div>

          {/* Custom Contract Switcher Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="block font-semibold text-slate-300 text-xs">
              Custom Contract Address
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errorMsg && <p className="text-rose-400 text-[11px]">{errorMsg}</p>}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Reset to Default
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

