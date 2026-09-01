import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatEther, parseEther, isAddress, getAddress } from 'viem';
import { ESCROW_ABI } from '../contract/abi.ts';
import { DEFAULT_ESCROW_CONTRACT_ADDRESS } from '../contract/config.ts';
import { DealData, DealDisplay, DealStatus, TxFeedbackState } from '../types.ts';

export function useEscrow() {
  const { address: userAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [contractAddress, setContractAddress] = useState<`0x${string}`>(DEFAULT_ESCROW_CONTRACT_ADDRESS);

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
      if (totalDeals === 0) {
        setDeals([]);
        setIsDealsLoading(false);
        setLastRefreshed(new Date());
        return;
      }

      // Fetch deals in parallel
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

      const parsed: DealDisplay[] = rawDeals
        .map((d) => {
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
        })
        .reverse(); // Newest first

      setDeals(parsed);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setIsDealsLoading(false);
    }
  }, [publicClient, contractAddress, userAddress]);

  // Initial load and periodic background poll
  useEffect(() => {
    fetchAllDeals();
    const interval = setInterval(() => {
      fetchAllDeals();
      refetchCount();
      refetchBalance();
    }, 12000);
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
      // Refetch state immediately
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
    if (!isConnected || !userAddress) {
      throw new Error('Please connect your wallet first.');
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
  };

  // Release Funds function
  const releaseFunds = async (dealId: number) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet.');
    }

    setTxState({
      isOpen: true,
      type: 'release',
      step: 'signing',
      dealId,
      title: `Release Funds for Deal #${dealId}`,
    });

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
  };

  // Reclaim Funds function
  const reclaimFunds = async (dealId: number) => {
    if (!isConnected) {
      throw new Error('Please connect your wallet.');
    }

    setTxState({
      isOpen: true,
      type: 'reclaim',
      step: 'signing',
      dealId,
      title: `Reclaim Funds for Deal #${dealId}`,
    });

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
    return Number(dealCountData);
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
