import React, { useState } from 'react';
import { X, Lock, AlertCircle, Clock, ArrowRight, Shield, CheckCircle2, User, Sparkles } from 'lucide-react';
import { isAddress, getAddress } from 'viem';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

interface CreateDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (seller: string, amountEth: string, deadlineUnix: number, title: string) => Promise<any>;
}

const DEADLINE_PRESETS = [
  { label: '15 Mins (Demo)', seconds: 15 * 60 },
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
  const { address: userAddress, isConnected } = useAccount();
  const { authenticated, login } = usePrivy();

  const [title, setTitle] = useState('');
  const [seller, setSeller] = useState('');
  const [amountEth, setAmountEth] = useState('');
  const [deadlineMode, setDeadlineMode] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetSeconds, setSelectedPresetSeconds] = useState(24 * 60 * 60);
  const [customDateTime, setCustomDateTime] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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

    if (!isConnected || !userAddress) {
      setErrorMsg('Please connect your Web3 wallet first.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive deal title.');
      return;
    }

    if (!seller.trim() || !isAddress(seller.trim())) {
      setErrorMsg('Please enter a valid Ethereum address for the seller.');
      return;
    }

    const cleanSeller = getAddress(seller.trim());
    if (cleanSeller.toLowerCase() === userAddress.toLowerCase()) {
      setErrorMsg('Seller address cannot be your own connected wallet.');
      return;
    }

    const parsedEth = parseFloat(amountEth);
    if (!amountEth || isNaN(parsedEth) || parsedEth <= 0) {
      setErrorMsg('Please enter a valid ETH amount greater than 0.');
      return;
    }

    const deadlineUnix = calculateDeadlineUnix();
    const nowSec = Math.floor(Date.now() / 1000);
    if (!deadlineUnix || deadlineUnix <= nowSec) {
      setErrorMsg('The reclaim deadline must be in the future.');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create Escrow Deal</h2>
              <p className="text-xs text-slate-400">Lock ETH funds into smart contract referee</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Deal Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Deal Title / Reference
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 3D Model Deliverables, Domain Name Purchase"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>

          {/* Seller Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Seller Counterparty Address
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="0x..."
                value={seller}
                onChange={(e) => setSeller(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              The wallet address that will receive the funds once you release them.
            </p>
          </div>

          {/* Escrow Amount */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Deposit Amount (ETH)
              </label>
              <span className="text-[11px] text-blue-400">Base Sepolia ETH</span>
            </div>
            <input
              type="number"
              step="0.0001"
              min="0.000001"
              required
              placeholder="0.01"
              value={amountEth}
              onChange={(e) => setAmountEth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            {/* Quick amount chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
              {ETH_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setAmountEth(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    amountEth === preset
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {preset} ETH
                </button>
              ))}
            </div>
          </div>

          {/* Reclaim Deadline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Delivery Deadline & Reclaim Time
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeadlineMode('preset')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    deadlineMode === 'preset'
                      ? 'bg-slate-800 text-blue-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlineMode('custom')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    deadlineMode === 'custom'
                      ? 'bg-slate-800 text-blue-400 font-semibold'
                      : 'text-slate-400 hover:text-white'
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
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                      selectedPresetSeconds === p.seconds
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
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
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            )}

            <p className="mt-2 text-[11px] text-slate-400">
              If the seller does not deliver by this deadline, you can trigger a 100% refund reclamation.
            </p>
          </div>

          {/* Escrow Guarantee Infobox */}
          <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Trustless Referee Guarantee</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 list-disc list-inside text-[11px]">
              <li>Funds remain locked in the onchain contract until you release them.</li>
              <li>Only you (the buyer) can trigger release to the seller.</li>
              <li>You can reclaim 100% of your deposit immediately if the deadline passes.</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            {!authenticated ? (
              <button
                type="button"
                onClick={() => login()}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Log In with Privy to Deposit</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isConnected}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting to Chain...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Deposit & Create Deal</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
