import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatEther, parseEther, isAddress, getAddress } from 'viem';
import { ESCROW_ABI } from '../contract/abi.ts';
import { DEFAULT_ESCROW_CONTRACT_ADDRESS } from '../contract/config.ts';
import { DealData, DealDisplay, DealStatus, TxFeedbackState } from '../types.ts';
import { useAppAuth } from '../context/AuthContext.tsx';

export function useEscrow() {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { profile } = useAppAuth();
  const publicClient = usePublicClient();
  const [contractAddress, setContractAddress] = useState<`0x${string}`>(DEFAULT_ESCROW_CONTRACT_ADDRESS);

  // Active user address from Wagmi or Auth profile
  const userAddress = wagmiAddress || profile.address;

  // Local feedback state for transactions
  const [txState, setTxState] = useState<TxFeedbackState>({
    isOpen: false,
    type: 'idle',
    step: 'preparing',
  });

  const { writeContractAsync } = useWriteContract();

  // Read total deal count
  const {
    data: dealCountData,
    refetch: refetchCount,
  } = useReadContract({
    address: contractAddress,
    abi: ESCROW_ABI,
    functionName: 'dealCount',
  });

  // Read contract ETH balance
  const {
    data: contractBalanceData,
    refetch: refetchBalance,
  } = useReadContract({
    address: contractAddress,
    abi: ESCROW_ABI,
    functionName: 'getContractBalance',
  });

  // State to store full list of deals
  const [deals, setDeals] = useState<DealDisplay[]>([]);
  const [localDemoDeals, setLocalDemoDeals] = useState<DealDisplay[]>([]);
  const [isDealsLoading, setIsDealsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Fetch all deals from the contract
  const fetchAllDeals = useCallback(async () => {
    if (!publicClient) return;
    setIsDealsLoading(true);
    try {
      const count = await (publicClient as any).readContract({
        address: contractAddress,
        abi: ESCROW_ABI,
        functionName: 'dealCount',
      });

      const totalDeals = Number(count);
      let parsed: DealDisplay[] = [];

      if (totalDeals > 0) {
        const dealPromises: Promise<any>[] = [];
        for (let i = 1; i <= totalDeals; i++) {
          dealPromises.push(
            (publicClient as any).readContract({
              address: contractAddress,
              abi: ESCROW_ABI,
              functionName: 'getDeal',
              args: [BigInt(i)],
            })
          );
        }

        const rawDeals = (await Promise.all(dealPromises)) as DealData[];
        const now = Math.floor(Date.now() / 1000);

        parsed = rawDeals.map((d) => {
          const id = Number(d.id);
          const deadlineSec = Number(d.deadline);
          const isExpired = now >= deadlineSec;
          const statusNum = Number(d.status) as DealStatus;

          let statusLabel: DealDisplay['statusLabel'] = 'Active';
          if (statusNum === DealStatus.Released) {
            statusLabel = 'Released';
          } else if (statusNum === DealStatus.Reclaimed) {
            statusLabel = 'Reclaimed';
          } else if (isExpired) {
            statusLabel = 'Expired (Ready to Reclaim)';
          }

          let role: DealDisplay['role'] = 'viewer';
          if (userAddress) {
            const normalizedUser = userAddress.toLowerCase();
            if (d.buyer.toLowerCase() === normalizedUser) {
              role = 'buyer';
            } else if (d.seller.toLowerCase() === normalizedUser) {
              role = 'seller';
            }
          }

          return {
            id,
            buyer: d.buyer,
            seller: d.seller,
            amountEth: formatEther(d.amount),
            amountWei: d.amount,
            deadlineTimestamp: deadlineSec,
            deadlineFormatted: new Date(deadlineSec * 1000).toLocaleString(),
            isExpired,
            status: statusNum,
            statusLabel,
            title: d.title || `Escrow Deal #${id}`,
            createdAt: Number(d.createdAt),
            createdAtFormatted: new Date(Number(d.createdAt) * 1000).toLocaleString(),
            role,
          };
        });
      }

      // Combine onchain deals + local demo deals
      const combined = [...localDemoDeals, ...parsed];
      // Update roles for current user
      const mapped = combined.map((d) => {
        let role: DealDisplay['role'] = 'viewer';
        if (userAddress) {
          const normalizedUser = userAddress.toLowerCase();
          if (d.buyer.toLowerCase() === normalizedUser) {
            role = 'buyer';
          } else if (d.seller.toLowerCase() === normalizedUser) {
            role = 'seller';
          }
        }
        return { ...d, role };
      });

      // Deduplicate by ID and reverse
      const uniqueMap = new Map<number, DealDisplay>();
      mapped.forEach((item) => uniqueMap.set(item.id, item));
      const sorted = Array.from(uniqueMap.values()).reverse();

      setDeals(sorted);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Failed to load onchain deals (fallback to cached/demo):', err);
    } finally {
      setIsDealsLoading(false);
    }
  }, [publicClient, contractAddress, userAddress, localDemoDeals]);

  // Initial load and periodic background poll
  useEffect(() => {
    fetchAllDeals();
    const interval = setInterval(() => {
      fetchAllDeals();
      refetchCount();
      refetchBalance();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchAllDeals, refetchCount, refetchBalance]);

  // Watch for active transaction receipt
  const {
    data: txReceipt,
    isLoading: isTxMining,
    isSuccess: isTxConfirmed,
    error: txError,
  } = useWaitForTransactionReceipt({
    hash: txState.txHash,
  });

  // Update tx state when mining or confirmed
  useEffect(() => {
    if (isTxMining) {
      setTxState((prev) => ({ ...prev, step: 'mining' }));
    }
  }, [isTxMining]);

  useEffect(() => {
    if (isTxConfirmed && txReceipt) {
      setTxState((prev) => ({ ...prev, step: 'success' }));
      fetchAllDeals();
      refetchCount();
      refetchBalance();
    }
  }, [isTxConfirmed, txReceipt, fetchAllDeals, refetchCount, refetchBalance]);

  useEffect(() => {
    if (txError) {
      setTxState((prev) => ({
        ...prev,
        step: 'error',
        errorMessage: txError.message || 'Transaction reverted or failed onchain.',
      }));
    }
  }, [txError]);

  // Create Deal function
  const createDeal = async (seller: string, amountEth: string, deadlineUnix: number, title: string) => {
    if (!profile.isAuthenticated || !userAddress) {
      throw new Error('Please log in with Privy or connect your wallet first.');
    }
    if (!isAddress(seller)) {
      throw new Error('Invalid Ethereum address for seller.');
    }
    const cleanSeller = getAddress(seller);
    if (cleanSeller.toLowerCase() === userAddress.toLowerCase()) {
      throw new Error('Seller address cannot be your own address.');
    }
    const parsedEth = parseFloat(amountEth);
    if (!amountEth || isNaN(parsedEth) || parsedEth <= 0) {
      throw new Error('Deposit amount must be greater than 0 ETH.');
    }
    const now = Math.floor(Date.now() / 1000);
    if (deadlineUnix <= now) {
      throw new Error('Deadline must be in the future.');
    }

    setTxState({
      isOpen: true,
      type: 'create',
      step: 'signing',
      title: title || 'New Escrow Deal',
    });

    // If connected via Web3 provider
    if (isConnected) {
      try {
        const hash = await (writeContractAsync as any)({
          address: contractAddress,
          abi: ESCROW_ABI,
          functionName: 'createDeal',
          args: [cleanSeller, BigInt(deadlineUnix), title],
          value: parseEther(amountEth),
        });

        setTxState((prev) => ({
          ...prev,
          step: 'mining',
          txHash: hash,
        }));

        return hash;
      } catch (err: any) {
        console.error('Create Deal failed:', err);
        const msg = err?.shortMessage || err?.message || 'Failed to submit createDeal transaction.';
        setTxState({
          isOpen: true,
          type: 'create',
          step: 'error',
          errorMessage: msg,
        });
        throw err;
      }
    } else {
      // Demo / simulated deal
      await new Promise((r) => setTimeout(r, 600));
      setTxState((prev) => ({ ...prev, step: 'mining' }));
      await new Promise((r) => setTimeout(r, 900));

      const newId = deals.length + 1;
      const demoDeal: DealDisplay = {
        id: newId,
        buyer: userAddress,
        seller: cleanSeller,
        amountEth,
        amountWei: parseEther(amountEth),
        deadlineTimestamp: deadlineUnix,
        deadlineFormatted: new Date(deadlineUnix * 1000).toLocaleString(),
        isExpired: false,
        status: DealStatus.Active,
        statusLabel: 'Active',
        title: title || `Escrow Deal #${newId}`,
        createdAt: now,
        createdAtFormatted: new Date(now * 1000).toLocaleString(),
        role: 'buyer',
      };

      setLocalDemoDeals((prev) => [demoDeal, ...prev]);
      setDeals((prev) => [demoDeal, ...prev]);
      setTxState((prev) => ({ ...prev, step: 'success' }));
      return '0x simulated';
    }
  };

  // Release Funds function
  const releaseFunds = async (dealId: number) => {
    if (!profile.isAuthenticated) {
      throw new Error('Please log in with Privy or connect your wallet.');
    }

    setTxState({
      isOpen: true,
      type: 'release',
      step: 'signing',
      dealId,
      title: `Release Funds for Deal #${dealId}`,
    });

    if (isConnected) {
      try {
        const hash = await (writeContractAsync as any)({
          address: contractAddress,
          abi: ESCROW_ABI,
          functionName: 'releaseFunds',
          args: [BigInt(dealId)],
        });

        setTxState((prev) => ({
          ...prev,
          step: 'mining',
          txHash: hash,
        }));

        return hash;
      } catch (err: any) {
        console.error('Release Funds failed:', err);
        const msg = err?.shortMessage || err?.message || 'Failed to release funds.';
        setTxState({
          isOpen: true,
          type: 'release',
          step: 'error',
          dealId,
          errorMessage: msg,
        });
        throw err;
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      setTxState((prev) => ({ ...prev, step: 'mining' }));
      await new Promise((r) => setTimeout(r, 800));

      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: DealStatus.Released, statusLabel: 'Released' } : d))
      );
      setLocalDemoDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: DealStatus.Released, statusLabel: 'Released' } : d))
      );
      setTxState((prev) => ({ ...prev, step: 'success' }));
      return '0x simulated';
    }
  };

  // Reclaim Funds function
  const reclaimFunds = async (dealId: number) => {
    if (!profile.isAuthenticated) {
      throw new Error('Please log in with Privy or connect your wallet.');
    }

    setTxState({
      isOpen: true,
      type: 'reclaim',
      step: 'signing',
      dealId,
      title: `Reclaim Funds for Deal #${dealId}`,
    });

    if (isConnected) {
      try {
        const hash = await (writeContractAsync as any)({
          address: contractAddress,
          abi: ESCROW_ABI,
          functionName: 'reclaimFunds',
          args: [BigInt(dealId)],
        });

        setTxState((prev) => ({
          ...prev,
          step: 'mining',
          txHash: hash,
        }));

        return hash;
      } catch (err: any) {
        console.error('Reclaim Funds failed:', err);
        const msg = err?.shortMessage || err?.message || 'Failed to reclaim funds.';
        setTxState({
          isOpen: true,
          type: 'reclaim',
          step: 'error',
          dealId,
          errorMessage: msg,
        });
        throw err;
      }
    } else {
      await new Promise((r) => setTimeout(r, 600));
      setTxState((prev) => ({ ...prev, step: 'mining' }));
      await new Promise((r) => setTimeout(r, 800));

      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: DealStatus.Reclaimed, statusLabel: 'Reclaimed' } : d))
      );
      setLocalDemoDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, status: DealStatus.Reclaimed, statusLabel: 'Reclaimed' } : d))
      );
      setTxState((prev) => ({ ...prev, step: 'success' }));
      return '0x simulated';
    }
  };

  const closeTxModal = () => {
    setTxState({
      isOpen: false,
      type: 'idle',
      step: 'preparing',
    });
  };

  const contractBalanceEth = useMemo(() => {
    if (contractBalanceData === undefined) return '0.00';
    return formatEther(contractBalanceData as bigint);
  }, [contractBalanceData]);

  const dealCount = useMemo(() => {
    if (dealCountData === undefined) return deals.length;
    return Math.max(Number(dealCountData), deals.length);
  }, [dealCountData, deals.length]);

  return {
    contractAddress,
    setContractAddress,
    deals,
    isDealsLoading,
    dealCount,
    contractBalanceEth,
    lastRefreshed,
    txState,
    createDeal,
    releaseFunds,
    reclaimFunds,
    closeTxModal,
    refreshDeals: fetchAllDeals,
  };
}
