import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  ExternalLink,
  Layers,
  Droplets,
} from 'lucide-react';
import { truncateAddress, getExplorerAddressUrl } from '../contract/config.ts';
import { useAppAuth } from '../context/AuthContext.tsx';
import { DealDisplay, DealStatus } from '../types.ts';

interface LandingPageProps {
  onEnterApp: () => void;
  contractAddress: string;
  contractBalanceEth: string;
  dealCount: number;
  deals: DealDisplay[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  contractAddress,
  contractBalanceEth,
  dealCount,
  deals,
}) => {
  const { profile, loginWithPrivy } = useAppAuth();
  const isAuthenticated = profile.isAuthenticated && !!profile.address;

  // Anything clicked from the landing page prompts login if not authenticated
  const handleProtectedAction = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      loginWithPrivy();
    } else {
      onEnterApp();
    }
  };

  // Interactive step visualizer state
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: '1. Deposit funds',
      tag: 'Buyer',
      summary: 'The buyer deposits funds into safe escrow before work starts.',
      details: 'Funds are locked safely. Neither party can take the money until agreed conditions are met.',
      icon: Lock,
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      statePreview: {
        status: 'Funds safe in escrow',
        amount: '0.25 ETH',
        countdown: '48 hours remaining',
        actor: 'Buyer deposited payment',
      },
    },
    {
      num: '02',
      title: '2. Complete work',
      tag: 'Seller',
      summary: 'The seller fulfills the order knowing payment is already safely deposited and waiting.',
      details: 'Sellers never have to worry about unpaid invoices or broken promises.',
      icon: Layers,
      badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
      statePreview: {
        status: 'Work in progress',
        amount: '0.25 ETH',
        countdown: '36 hours remaining',
        actor: 'Seller fulfilling order',
      },
    },
    {
      num: '03',
      title: '3. Approve & pay',
      tag: 'Buyer',
      summary: 'The buyer reviews the finished work and releases payment directly to the seller.',
      details: '100% of the funds go straight to the seller instantly with zero deductions.',
      icon: CheckCircle2,
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      statePreview: {
        status: 'Completed & Paid',
        amount: '0.25 ETH',
        countdown: 'Payment completed',
        actor: 'Funds sent to seller',
      },
    },
    {
      num: '04',
      title: '4. Safe refund',
      tag: 'Guarantee',
      summary: 'If the agreed deadline passes without delivery, the buyer can safely take their deposit back.',
      details: 'Automatic deadline protection ensures buyers never lose money if work is not delivered.',
      icon: RotateCcw,
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      statePreview: {
        status: 'Deadline passed',
        amount: '0.25 ETH',
        countdown: 'Expired',
        actor: 'Buyer can claim refund',
      },
    },
  ];

  const activeDealsList = deals.filter((d) => d.status === DealStatus.Active).slice(0, 3);

  return (
    <div className="min-h-screen w-full bg-[#080b0f] text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white overflow-x-hidden">
      {/* Landing Navbar */}
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#080b0f]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              onClick={handleProtectedAction}
              className="flex items-center gap-2.5 cursor-pointer group"
              title={isAuthenticated ? 'Open Dashboard' : 'Log in to open app'}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-950/40 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight font-display group-hover:text-emerald-300 transition-colors">
                  Onchain Escrow
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Base Sepolia</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#why-safe" className="hover:text-white transition-colors">
                Why It's Safe
              </a>
              <a href="#live-stats" className="hover:text-white transition-colors">
                Activity
              </a>
            </nav>

            {/* Single clean action button: Only ONE button! */}
            <div className="flex items-center">
              {isAuthenticated ? (
                <button
                  onClick={onEnterApp}
                  className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
                  <span>Open App</span>
                </button>
              ) : (
                <button
                  onClick={loginWithPrivy}
                  className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Landing Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe & Simple • 0% Fee</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight font-display max-w-4xl mx-auto leading-tight">
            Safe payments between buyers and sellers
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Hold money safely until the work is done. Buyers only pay when they're happy, and sellers know funds are ready before starting.
          </p>

          {/* Single clean Hero CTA: No duplicate or contradicting buttons */}
          <div className="flex items-center justify-center pt-2 max-w-xs mx-auto">
            {isAuthenticated ? (
              <button
                onClick={onEnterApp}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={loginWithPrivy}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>Log In</span>
              </button>
            )}
          </div>

          {/* Metrics Ribbon */}
          <div id="live-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-10 text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#0f141c] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Total Deposited</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                {contractBalanceEth} ETH
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">Held safely in escrow</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Total Deals</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                {dealCount}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Created by users</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Platform Fee</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
                0%
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">100% goes to seller</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0f141c] border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-medium block">Network</span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
                Base
              </span>
              <span className="text-[10px] text-teal-400 mt-0.5 block">Fast & low fees</span>
            </div>
          </div>
        </section>

        {/* Interactive Workflow Section */}
        <section id="how-it-works" className="py-14 sm:py-20 border-t border-slate-800/60 bg-[#0b0e14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                How It Works
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
                Simple protection in 4 easy steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                Click each step to see how both buyer and seller stay protected.
              </p>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={step.num}
                    onClick={() => setActiveStep(idx)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#131a24] border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-[#0f141c]/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-slate-500">{step.num}</span>
                      <IconComponent
                        className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}
                      />
                    </div>
                    <h3 className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                      {step.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{step.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Deep-Dive Showcase */}
            <div className="rounded-2xl bg-[#111722] border border-slate-800 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-3.5">
                <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${steps[activeStep].badgeColor}`}>
                  <span>Step {steps[activeStep].num}</span>
                  <span>•</span>
                  <span>{steps[activeStep].tag}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  {steps[activeStep].title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {steps[activeStep].summary}
                </p>

                <div className="p-3.5 rounded-xl bg-[#090d14] border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-200 font-semibold block mb-1">How it protects you:</span>
                  {steps[activeStep].details}
                </div>
              </div>

              {/* State Machine Visual Card */}
              <div className="lg:col-span-5">
                <div className="p-4 sm:p-5 rounded-2xl bg-[#090d14] border border-slate-800/90 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-slate-500 text-[11px]">Deal Example</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      Protected
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <span className="text-white font-semibold">{steps[activeStep].statePreview.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount:</span>
                      <span className="text-emerald-400 font-bold">{steps[activeStep].statePreview.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timer:</span>
                      <span className="text-amber-300">{steps[activeStep].statePreview.countdown}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Action:</span>
                      <span className="text-slate-300">{steps[activeStep].statePreview.actor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why It's Safe Section */}
        <section id="why-safe" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider font-mono">
              Safety & Trust
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 font-display">
              Built to protect your money
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              No middlemen, no hidden fees, and no surprise account freezes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">You stay in control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Funds are held safely by code. No single person or company can touch, freeze, or take your deposit.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Guaranteed deadlines</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every deal has a set timer. If the work is not delivered before the timer ends, the buyer can safely take their money back.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-[#0f141c] border border-slate-800 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white font-display">Zero platform fees</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We take 0% fee. Every cent deposited by the buyer goes directly to the seller when approved.
              </p>
            </div>
          </div>
        </section>

        {/* Live Deals Teaser Section (if any exist) */}
        {activeDealsList.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/60">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white font-display">Recent Deals</h3>
              <p className="text-xs text-slate-400">Examples of agreements protected by escrow</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {activeDealsList.map((deal) => (
                <div
                  key={deal.id}
                  onClick={handleProtectedAction}
                  className="p-4 rounded-2xl bg-[#0f141c] border border-slate-800 hover:border-emerald-500/40 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-slate-400">#{deal.id}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{deal.title}</h4>
                  <div className="text-base font-bold font-mono text-white">
                    {deal.amountEth} <span className="text-xs text-slate-400 font-sans">ETH</span>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between items-center">
                    <span>Seller: {truncateAddress(deal.seller, 4, 3)}</span>
                    <span className="text-emerald-400 font-sans group-hover:text-emerald-300">
                      View details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#06080c] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Onchain Escrow • Base Sepolia Protocol</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={getExplorerAddressUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Contract: {truncateAddress(contractAddress, 4, 3)}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href="https://www.alchemy.com/faucets/base-sepolia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-[11px]"
            >
              <Droplets className="w-3 h-3 text-teal-400" />
              <span>Base Sepolia Faucet</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
