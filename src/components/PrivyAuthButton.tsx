import React from 'react';
import { User, ChevronDown, Lock } from 'lucide-react';
import { truncateAddress } from '../contract/config.ts';
import { useAppAuth } from '../context/AuthContext.tsx';

export const PrivyAuthButton: React.FC = () => {
  const { profile, setIsModalOpen } = useAppAuth();

  if (!profile.isAuthenticated || !profile.address) {
    return (
      <button
        onClick={() => setIsModalOpen(true)}
        className="h-8.5 sm:h-9.5 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Log In</span>
      </button>
    );
  }

  const label = profile.name || (profile.email ? profile.email.split('@')[0] : truncateAddress(profile.address, 4, 3));

  return (
    <button
      onClick={() => setIsModalOpen(true)}
      className="h-8.5 sm:h-9.5 pl-2 pr-2.5 sm:pl-2.5 sm:pr-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white text-xs font-medium transition-all flex items-center gap-1.5 sm:gap-2 shadow-sm cursor-pointer shrink-0 max-w-[120px] sm:max-w-[170px]"
    >
      <div className="w-5 h-5 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
        <User className="w-3 h-3" />
      </div>

      <span className="text-xs font-semibold text-slate-200 truncate">
        {label}
      </span>

      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
      <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
    </button>
  );
};
