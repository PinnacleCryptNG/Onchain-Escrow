import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Lock,
  Layers,
  CheckCircle2,
  RotateCcw,
  Clock,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { DealDisplay, DealFilterTab, DealStatus } from '../types.ts';
import { DealCard } from './DealCard.tsx';

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
    <div className="space-y-6">
      {/* Controls Bar: Tabs, Search, and Create Deal Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Deals ({deals.length})
          </button>

          {userAddress && (
            <>
              <button
                onClick={() => setActiveTab('as_buyer')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'as_buyer'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                As Buyer ({buyerCount})
              </button>
              <button
                onClick={() => setActiveTab('as_seller')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'as_seller'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                As Seller ({sellerCount})
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Active ({activeCount})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Settled ({completedCount})
          </button>
        </div>

        {/* Right side: Search & Create Deal Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search ID, title, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={onOpenCreateDeal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/25 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* Deal Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse p-6 space-y-4"
            >
              <div className="flex justify-between">
                <div className="w-16 h-5 bg-slate-800 rounded-lg" />
                <div className="w-24 h-5 bg-slate-800 rounded-full" />
              </div>
              <div className="w-3/4 h-6 bg-slate-800 rounded-lg" />
              <div className="w-1/2 h-8 bg-slate-800 rounded-lg" />
              <div className="w-full h-16 bg-slate-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
        <div className="text-center py-16 px-4 rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-4">
            <Inbox className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            {searchQuery ? 'No matching escrow deals found' : 'No escrow deals in this view'}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            {searchQuery
              ? 'Try modifying your search keywords or clear the filter.'
              : 'Lock funds in the Base Sepolia escrow contract to initiate a trustless peer-to-peer deal.'}
          </p>
          <button
            onClick={onOpenCreateDeal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Deal</span>
          </button>
        </div>
      )}
    </div>
  );
};
