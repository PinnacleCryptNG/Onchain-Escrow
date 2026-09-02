import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ProtocolStats } from './components/ProtocolStats.tsx';
import { HowItWorksBanner } from './components/HowItWorksBanner.tsx';
import { DealList } from './components/DealList.tsx';
import { CreateDealModal } from './components/CreateDealModal.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { ContractConfigModal } from './components/ContractConfigModal.tsx';
import { PrivyAuthModal } from './components/PrivyAuthModal.tsx';
import { useEscrow } from './hooks/useEscrow.ts';
import { useAppAuth } from './context/AuthContext.tsx';
import { ShieldCheck, Plus, ExternalLink, Droplets, Lock } from 'lucide-react';
import { getExplorerAddressUrl, truncateAddress } from './contract/config.ts';

export default function App() {
  const { profile, loginWithPrivy } = useAppAuth();
  const userAddress = profile.address || undefined;

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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-800 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Base Sepolia Protocol • Non-Custodial Smart Escrow</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Peer-to-Peer Escrow Settlement
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Deposit funds into a verified immutable smart contract on Base Sepolia. Funds remain locked until the buyer approves release upon milestone delivery, or can be reclaimed if the deadline elapses.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Escrow Deal</span>
              </button>

              {!profile.isAuthenticated && (
                <button
                  onClick={loginWithPrivy}
                  className="px-4 py-3 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-blue-400" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Protocol Live Stats */}
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
                  ? `Connected: ${profile.name || truncateAddress(userAddress, 6, 4)} — filter by your active deals below.`
                  : 'Connect your wallet or log in with Privy to manage your buyer and seller agreements.'}
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

            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Base Sepolia Faucet</span>
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

      <PrivyAuthModal />
    </div>
  );
}
