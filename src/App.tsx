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
    <div className="min-h-screen w-full bg-[#090d16] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white overflow-x-hidden">
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] border border-slate-800 p-4 sm:p-6 lg:p-8">
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] sm:text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Base Sepolia • Non-Custodial Smart Escrow</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-display">
                Peer-to-Peer Escrow Settlement
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Deposit funds into a verified immutable smart contract on Base Sepolia. Funds remain locked until the buyer approves release upon milestone delivery, or can be reclaimed if the deadline elapses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0">
              {profile.isAuthenticated && profile.address ? (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Escrow Deal</span>
                </button>
              ) : (
                <button
                  onClick={loginWithPrivy}
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-white" />
                  <span>Log In to Transact</span>
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
        <section className="space-y-4 pt-1 sm:pt-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
              Onchain Escrow Deals
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {userAddress
                ? `Connected: ${profile.name || truncateAddress(userAddress, 5, 4)}`
                : 'Connect your wallet or log in with Privy to manage your buyer and seller agreements.'}
            </p>
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
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-12 sm:mt-16 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Onchain Escrow • Base Sepolia Protocol</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1 font-mono text-[11px] sm:text-xs"
            >
              <span>Contract: {truncateAddress(contractAddress, 4, 3)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors flex items-center gap-1 text-[11px] sm:text-xs"
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
