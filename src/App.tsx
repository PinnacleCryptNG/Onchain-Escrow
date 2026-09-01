import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from './components/Navbar.tsx';
import { ProtocolStats } from './components/ProtocolStats.tsx';
import { HowItWorksBanner } from './components/HowItWorksBanner.tsx';
import { DealList } from './components/DealList.tsx';
import { CreateDealModal } from './components/CreateDealModal.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { ContractConfigModal } from './components/ContractConfigModal.tsx';
import { useEscrow } from './hooks/useEscrow.ts';
import { ShieldCheck, Plus, ExternalLink, Lock, CheckCircle2, Droplets, Info } from 'lucide-react';
import { getExplorerAddressUrl, truncateAddress } from './contract/config.ts';

export default function App() {
  const { address: userAddress, isConnected } = useAccount();
  const {
    contractAddress,
    setContractAddress,
    deals,
    isDealsLoading,
    dealCount,
    contractBalanceEth,
    txState,
    createDeal,
    releaseFunds,
    reclaimFunds,
    closeTxModal,
    refreshDeals,
  } = useEscrow();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        contractAddress={contractAddress}
        contractBalanceEth={contractBalanceEth}
        dealCount={dealCount}
        onOpenContractSettings={() => setIsConfigModalOpen(true)}
        onOpenCreateDeal={() => setIsCreateModalOpen(true)}
        onRefresh={refreshDeals}
        isRefreshing={isDealsLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span>Base Sepolia Live Escrow Protocol</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Trade Safely with Strangers. <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                The Contract is the Referee.
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Lock funds in an immutable smart contract. The seller delivers with confidence, the buyer releases when satisfied, or reclaims deposits after the deadline expires.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Deal</span>
            </button>
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Verify Contract</span>
            </button>
          </div>
        </div>

        {/* Protocol Stats */}
        <ProtocolStats
          deals={deals}
          contractBalanceEth={contractBalanceEth}
          dealCount={dealCount}
        />

        {/* How It Works Explainer Banner */}
        <HowItWorksBanner />

        {/* Live Deals Section */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Onchain Escrow Deals</h2>
              <p className="text-xs text-slate-400">
                {userAddress
                  ? `Connected: ${truncateAddress(userAddress, 6, 4)} — filter by your active deals below.`
                  : 'Connect your wallet to manage your buyer and seller agreements.'}
              </p>
            </div>
          </div>

          <DealList
            deals={deals}
            isLoading={isDealsLoading}
            userAddress={userAddress}
            onOpenCreateDeal={() => setIsCreateModalOpen(true)}
            onRelease={releaseFunds}
            onReclaim={reclaimFunds}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Onchain Escrow on Base Sepolia • Checks-Effects-Interactions (CEI) Protocol</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1 font-mono"
            >
              <span>Contract: {truncateAddress(contractAddress, 6, 4)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://sepolia.basescan.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Basescan Sepolia
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateDealModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createDeal}
      />

      <ContractConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentAddress={contractAddress}
        onUpdateAddress={setContractAddress}
      />

      <TransactionModal
        txState={txState}
        onClose={closeTxModal}
      />
    </div>
  );
}
