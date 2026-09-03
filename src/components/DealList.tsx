import React, { useState, useMemo } from 'react';
import { Search, Plus, Inbox, Lock } from 'lucide-react';
import { DealDisplay, DealFilterTab, DealStatus } from '../types.ts';
import { DealCard } from './DealCard.tsx';
import { useAppAuth } from '../context/AuthContext.tsx';

interface DealListProps {
  deals: DealDisplay[];
  isLoading: boolean;
  userAddress?: string;
  onOpenCreateDeal: () => void;
  onRelease: (dealId: number) => void;
  onReclaim: (dealId: number) => void;
}

export const DealList: React.FC<DealListProps> = ({
  deals,
  isLoading,
  userAddress,
  onOpenCreateDeal,
  onRelease,
  onReclaim,
}) => {
  const [activeTab, setActiveTab] = useState<DealFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { profile, loginWithPrivy } = useAppAuth();
  const isAuthenticated = profile.isAuthenticated && !!profile.address;

  // Filter deals based on tab and search
  const filteredDeals = useMemo(() => {
    let list = [...deals];

    // Filter by tab
    if (activeTab === 'as_buyer') {
      list = list.filter((d) => d.role === 'buyer');
    } else if (activeTab === 'as_seller') {
      list = list.filter((d) => d.role === 'seller');
    } else if (activeTab === 'active') {
      list = list.filter((d) => d.status === DealStatus.Active);
    } else if (activeTab === 'completed') {
      list = list.filter((d) => d.status === DealStatus.Released || d.status === DealStatus.Reclaimed);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.id.toString().includes(q) ||
          d.buyer.toLowerCase().includes(q) ||
          d.seller.toLowerCase().includes(q)
      );
    }

    return list;
  }, [deals, activeTab, searchQuery]);

  // Counts for tabs
  const buyerCount = useMemo(() => deals.filter((d) => d.role === 'buyer').length, [deals]);
  const sellerCount = useMemo(() => deals.filter((d) => d.role === 'seller').length, [deals]);
  const activeCount = useMemo(() => deals.filter((d) => d.status === DealStatus.Active).length, [deals]);
  const completedCount = useMemo(
    () => deals.filter((d) => d.status === DealStatus.Released || d.status === DealStatus.Reclaimed).length,
    [deals]
  );

  return (
    <div className="space-y-4 w-full">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
        {/* Filter Tabs (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none w-full sm:w-auto shrink-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({deals.length})
          </button>

          {userAddress && (
            <>
              <button
                onClick={() => setActiveTab('as_buyer')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'as_buyer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buyer ({buyerCount})
              </button>
              <button
                onClick={() => setActiveTab('as_seller')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'as_seller'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Seller ({sellerCount})
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('active')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settled ({completedCount})
          </button>
        </div>

        {/* Search & New Deal */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              placeholder="Search by title or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          </div>

          {isAuthenticated && (
            <button
              onClick={onOpenCreateDeal}
              className="hidden xs:inline-flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          )}
        </div>
      </div>

      {/* Deal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-56 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse p-4 sm:p-5 space-y-4"
            >
              <div className="flex justify-between">
                <div className="w-16 h-5 bg-slate-800 rounded-lg" />
                <div className="w-20 h-5 bg-slate-800 rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-slate-800 rounded-lg" />
              <div className="w-1/2 h-7 bg-slate-800 rounded-lg" />
              <div className="w-full h-14 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 w-full">
          {filteredDeals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              userAddress={userAddress}
              onRelease={onRelease}
              onReclaim={onReclaim}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-10 px-4 rounded-2xl bg-slate-900/30 border border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white mb-1 font-display">
            {searchQuery ? 'No matching escrow deals found' : 'No escrow deals yet'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'Try changing your search keywords.'
              : isAuthenticated
              ? 'Create your first escrow agreement to lock funds safely on Base Sepolia.'
              : 'Connect your wallet in the navigation bar above to create deals or interact with agreements.'}
          </p>
          {isAuthenticated && (
            <button
              onClick={onOpenCreateDeal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Escrow Deal</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
