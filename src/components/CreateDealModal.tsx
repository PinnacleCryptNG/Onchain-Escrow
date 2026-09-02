import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, AlertCircle, Shield } from 'lucide-react';
import { isAddress, getAddress } from 'viem';
import { useAppAuth } from '../context/AuthContext.tsx';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (seller: string, amountEth: string, deadlineUnix: number, title: string) => Promise<any>;
}

const DEADLINE_PRESETS = [
  { label: '15 Minutes', seconds: 15 * 60 },
  { label: '1 Hour', seconds: 60 * 60 },
  { label: '24 Hours', seconds: 24 * 60 * 60 },
  { label: '3 Days', seconds: 3 * 24 * 60 * 60 },
  { label: '7 Days', seconds: 7 * 24 * 60 * 60 },
  { label: '14 Days', seconds: 14 * 24 * 60 * 60 },
];

const ETH_PRESETS = ['0.001', '0.005', '0.01', '0.05', '0.1'];

export const CreateDealModal: React.FC<CreateDealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { profile, loginWithPrivy } = useAppAuth();
  const userAddress = profile.address;
  const isAuthenticated = profile.isAuthenticated;

  const [title, setTitle] = useState('');
  const [seller, setSeller] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [deadlineMode, setDeadlineMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetSeconds, setSelectedPresetSeconds] = useState(24 * 60 * 60);
  const [customDateTime, setCustomDateTime] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const calculateDeadlineUnix = (): number => {
    const nowSec = Math.floor(Date.now() / 1000);
    if (deadlineMode === 'preset') {
      return nowSec + selectedPresetSeconds;
    } else {
      if (!customDateTime) return 0;
      return Math.floor(new Date(customDateTime).getTime() / 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isAuthenticated || !userAddress) {
      setErrorMsg('Please connect your wallet first.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a deal title or description.');
      return;
    }

    if (!seller.trim() || !isAddress(seller.trim())) {
      setErrorMsg('Please enter a valid Ethereum address for the seller.');
      return;
    }

    const cleanSeller = getAddress(seller.trim());
    if (cleanSeller.toLowerCase() === userAddress.toLowerCase()) {
      setErrorMsg('Seller address cannot be your own wallet address.');
      return;
    }

    const parsedEth = parseFloat(amountEth);
    if (!amountEth || isNaN(parsedEth) || parsedEth <= 0) {
      setErrorMsg('Please enter an ETH deposit amount greater than 0.');
      return;
    }

    const deadlineUnix = calculateDeadlineUnix();
    const nowSec = Math.floor(Date.now() / 1000);
    if (!deadlineUnix || deadlineUnix <= nowSec) {
      setErrorMsg('The refund deadline must be in the future.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(cleanSeller, amountEth, deadlineUnix, title.trim());
      // Reset form on success
      setTitle('');
      setSeller('');
      setAmountEth('');
      setSelectedPresetSeconds(24 * 60 * 60);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.shortMessage || err?.message || 'Failed to submit transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800/80 bg-[#090d16]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Create Escrow Deal</h2>
              <p className="text-[11px] text-slate-400">Deposit ETH safely on Base Sepolia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Deal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Deal Title or Deliverable Description
            </label>
            <input
              type="text"
              placeholder="e.g. Website Design Milestone 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Seller Address */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Seller's Wallet Address
              </label>
            </div>
            <input
              type="text"
              placeholder="0x..."
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 font-mono text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Amount in ETH */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Deposit Amount (ETH)
              </label>
              <span className="text-[11px] text-slate-400">Base Sepolia</span>
            </div>
            <input
              type="number"
              step="0.0001"
              placeholder="0.01"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500">Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {ETH_PRESETS.map((eth) => (
                  <button
                    type="button"
                    key={eth}
                    onClick={() => setAmountEth(eth)}
                    className="px-2 py-0.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
                  >
                    {eth} ETH
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline Setting */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Delivery Deadline / Refund Window
              </label>
              <div className="flex items-center rounded-lg bg-[#090d16] p-0.5 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDeadlineMode('preset')}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                    deadlineMode === 'preset' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Preset
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlineMode('custom')}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                    deadlineMode === 'custom' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {deadlineMode === 'preset' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DEADLINE_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p.seconds}
                    onClick={() => setSelectedPresetSeconds(p.seconds)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border text-left transition-all cursor-pointer ${
                      selectedPresetSeconds === p.seconds
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'bg-[#090d16] border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="datetime-local"
                value={customDateTime}
                onChange={(e) => setCustomDateTime(e.target.value)}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090d16] border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => loginWithPrivy()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm transition-all cursor-pointer"
              >
                Sign in to Create Deal
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Deposit & Lock</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};

