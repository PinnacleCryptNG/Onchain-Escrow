import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Cpu, Code2, AlertTriangle } from 'lucide-react';
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Contract Verification & Settings</h2>
              <p className="text-xs text-slate-400">Base Sepolia Onchain Escrow Parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Active Contract Info */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Active Contract Address (Base Sepolia)
              </span>
              <a
                href={getExplorerAddressUrl(currentAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
              >
                <span>View on Basescan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-mono text-white text-xs break-all">{currentAddress}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                title="Copy address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Architecture & Security Guarantees */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-blue-300">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Checks-Effects-Interactions (CEI) Compliance</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Every state-modifying function strictly mutates contract storage before triggering external ETH transfers (<code className="text-blue-300">.call&#123;value: ...&#125;("")</code>) with full reentrancy guards to ensure safety on Base Sepolia.
            </p>
          </div>

          {/* Custom Contract Switcher Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-800">
            <label className="block font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
              Switch to Custom Deployed Contract
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
            {errorMsg && <p className="text-rose-400 text-[11px]">{errorMsg}</p>}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Reset to Default Base Sepolia Escrow
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors"
              >
                Update Active Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
