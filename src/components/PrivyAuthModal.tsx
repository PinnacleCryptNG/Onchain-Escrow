import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Wallet,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Droplets,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Key,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAppAuth } from '../context/AuthContext.tsx';
import { getExplorerAddressUrl, truncateAddress } from '../contract/config.ts';

type ModalView = 'main' | 'google_select' | 'email_otp' | 'twitter_auth' | 'wallet_select';

export const PrivyAuthModal: React.FC = () => {
  const {
    profile,
    isModalOpen,
    setIsModalOpen,
    loginWithGoogle,
    loginWithEmailOTP,
    loginWithTwitter,
    connectInjected,
    disconnect,
    pendingEmailForOtp,
    setPendingEmailForOtp,
    generatedOtpCode,
    setGeneratedOtpCode,
  } = useAppAuth();

  const [view, setView] = useState<ModalView>('main');
  const [emailInput, setEmailInput] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState('pinnaclecrypt');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showExportKey, setShowExportKey] = useState(false);
  const [mounted, setMounted] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset view state whenever modal opens or authentication status changes
  useEffect(() => {
    if (isModalOpen) {
      setView('main');
      setOtpError(null);
      setShowExportKey(false);
    }
  }, [isModalOpen, profile.isAuthenticated]);

  if (!isModalOpen || !mounted) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) return;

    setIsLoading(true);
    setPendingEmailForOtp(cleanEmail);
    // Generate a random 6-digit code for realistic demonstration
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtpCode(newCode);

    setTimeout(() => {
      setIsLoading(false);
      setView('email_otp');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError(null);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }, 400);
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const singleChar = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleChar;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto advance focus
    if (singleChar && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits are typed
    if (singleChar && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        verifyOtpCode(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    if (pastedData.length === 6) {
      verifyOtpCode(pastedData);
    } else {
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
    }
  };

  const verifyOtpCode = async (code: string) => {
    setIsLoading(true);
    setOtpError(null);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const success = await loginWithEmailOTP(pendingEmailForOtp, code);
      if (!success) {
        setOtpError('Invalid confirmation code. Please try again.');
        setIsLoading(false);
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleFillOtpHelper = () => {
    const chars = generatedOtpCode.split('');
    setOtpDigits(chars);
    verifyOtpCode(generatedOtpCode);
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-[360px] sm:max-w-[400px] bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-2.5">
          {view !== 'main' && !profile.isAuthenticated ? (
            <button
              onClick={() => setView('main')}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-300 tracking-tight font-display">
                Base Escrow
              </span>
            </div>
          )}

          <button
            onClick={() => setIsModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 sm:pt-2">
          {profile.isAuthenticated && profile.address ? (
            /* Authenticated Account View */
            <div className="space-y-4">
              <div className="text-center pb-2 border-b border-slate-800/80">
                <div className="w-12 h-12 rounded-full bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-base mb-2">
                  {profile.authMethod === 'google' ? (
                    <span className="text-red-400 font-bold">G</span>
                  ) : profile.authMethod === 'twitter' ? (
                    <span className="text-white font-bold">X</span>
                  ) : profile.authMethod === 'email' ? (
                    <Mail className="w-5 h-5 text-teal-400" />
                  ) : (
                    <Wallet className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {profile.name || profile.email || truncateAddress(profile.address, 6, 4)}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {profile.authMethod === 'google'
                    ? 'Connected via Google'
                    : profile.authMethod === 'twitter'
                    ? 'Connected via X (Twitter)'
                    : profile.authMethod === 'email'
                    ? 'Connected via Email'
                    : 'Connected via Browser Wallet'}
                </p>
              </div>

              {/* Embedded Wallet Address */}
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Base Sepolia Address</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {profile.isEmbedded ? 'Embedded Wallet' : 'External Wallet'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#0f172a] border border-slate-800/80 text-xs font-mono">
                  <span className="text-slate-200 truncate">
                    {truncateAddress(profile.address, 10, 8)}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => copyAddress(profile.address!)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Copy full address"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={getExplorerAddressUrl(profile.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-400 hover:text-teal-400 rounded hover:bg-slate-800 transition-colors"
                      title="View on Basescan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-1">
                <a
                  href="https://www.alchemy.com/faucets/base-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-teal-400" />
                    <span>Get Base Sepolia Testnet ETH</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                </a>

                {profile.isEmbedded && (
                  <button
                    onClick={() => setShowExportKey(!showExportKey)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      <span>{showExportKey ? 'Hide Private Key' : 'Export Private Key'}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showExportKey ? 'rotate-90' : ''}`} />
                  </button>
                )}

                {showExportKey && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Embedded Key Notice</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Your self-custody key is safely secured via Privy MPC encryption on Base Sepolia.
                    </p>
                  </div>
                )}
              </div>

              {/* Log Out */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    disconnect();
                    setIsModalOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : view === 'main' ? (
            /* Main Login Screen */
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-base font-bold text-white tracking-tight">Log in or sign up</h2>
                <p className="text-xs text-slate-400 mt-0.5">Connect with social account, email, or wallet</p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-2">
                {/* Google Button */}
                <button
                  onClick={() => setView('google_select')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Twitter / X Button */}
                <button
                  onClick={() => setView('twitter_auth')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1e293b] hover:bg-[#334155] border border-slate-700/80 hover:border-slate-600 text-xs font-semibold text-white flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span>Continue with X</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 font-medium">or</span>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !emailInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    <span>Continue with Email</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex items-center justify-center py-1">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0f172a] px-3 text-[11px] text-slate-500 font-medium">or</span>
              </div>

              {/* Connect Browser Wallet */}
              <button
                onClick={async () => {
                  await connectInjected();
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <span>Connect a wallet</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              {/* Footer */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Protected by Privy MPC Auth</span>
                </p>
              </div>
            </div>
          ) : view === 'google_select' ? (
            /* Google Sign-in Selector */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 20.4 7.5 23 12 23z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Choose Google Account</h3>
                <p className="text-xs text-slate-400 mt-0.5">to continue to Base Escrow</p>
              </div>

              <div className="space-y-2">
                {/* Default User Account */}
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await loginWithGoogle('pinnaclecrypt@gmail.com', 'Pinnacle Crypt');
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="w-full p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      P
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">pinnaclecrypt@gmail.com</div>
                      <div className="text-[11px] text-slate-400">Google Account</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>

                {/* Custom Google Email input toggle */}
                {!showCustomGoogleInput ? (
                  <button
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-800 text-xs text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-center cursor-pointer"
                  >
                    + Use another Google account
                  </button>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (customGoogleEmail.trim()) {
                        setIsLoading(true);
                        await loginWithGoogle(customGoogleEmail.trim());
                        setIsLoading(false);
                      }
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="your.google@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : view === 'twitter_auth' ? (
            /* X (Twitter) Auth Prompt */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-black border border-slate-700 flex items-center justify-center mx-auto mb-2 shadow-md">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Authorize Base Escrow</h3>
                <p className="text-xs text-slate-400 mt-0.5">Connect with your X account</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Your X handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">@</span>
                    <input
                      type="text"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value.replace('@', ''))}
                      className="w-full pl-7 pr-3 py-2 rounded-lg bg-[#0f172a] border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <p>This application will be able to:</p>
                  <ul className="list-disc list-inside text-slate-500 text-[10px] space-y-0.5">
                    <li>Verify your public X handle</li>
                    <li>Derive your non-custodial Base Sepolia wallet</li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    await loginWithTwitter(twitterHandle || 'pinnaclecrypt');
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-black text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <span>Authorize App</span>
                  )}
                </button>
              </div>
            </div>
          ) : view === 'email_otp' ? (
            /* Email OTP 6-digit Code Screen */
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-full bg-teal-600/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">Check your email</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter the 6-digit code sent to <span className="text-white font-medium">{pendingEmailForOtp}</span>
                </p>
              </div>

              {/* 6-digit PIN boxes */}
              <div className="flex justify-center gap-1.5 sm:gap-2 py-2" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-8.5 sm:w-10 h-10.5 sm:h-12 text-center font-mono text-base sm:text-lg font-bold text-white rounded-xl bg-[#090d16] border border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                ))}
              </div>

              {/* Interactive Quick Fill Helper */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                <div className="text-[11px] text-emerald-300">
                  <span>Code: </span>
                  <span className="font-mono font-bold text-white">{generatedOtpCode}</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillOtpHelper}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  Auto-fill
                </button>
              </div>

              {otpError && (
                <p className="text-center text-xs text-rose-400 font-medium">
                  {otpError}
                </p>
              )}

              {/* Submit / Resend */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={isLoading || otpDigits.join('').length !== 6}
                  onClick={() => verifyOtpCode(otpDigits.join(''))}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Submit Code</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtpCode(newCode);
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('main')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Change email
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
};
