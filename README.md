# Onchain Escrow Protocol

A decentralized, trustless escrow application deployed on **Base Sepolia** testnet where two strangers can trade goods or services safely without relying on a centralized intermediary.

The smart contract acts as the neutral referee:
1. **Buyer deposits funds & names a seller**: ETH is locked inside the immutable contract with an agreed delivery deadline.
2. **Seller fulfills delivery**: The seller delivers the agreed goods/services knowing payment is cryptographically secured.
3. **Buyer releases payment**: When satisfied, the buyer clicks **Release Funds**, instantly transferring 100% of the deposit to the seller.
4. **Reclaim if deadline elapses**: If the seller fails to deliver before the deadline, the buyer can trigger a 100% refund reclamation.

---

## 📜 Contract Deployment & Verification

- **Network**: Base Sepolia Testnet (Chain ID: `84532`)
- **Contract Address**: [`0x9A48F9E8cD6F27a8B8b9c8B72e12B4c6198C51E2`](https://sepolia.basescan.org/address/0x9A48F9E8cD6F27a8B8b9c8B72e12B4c6198C51E2)
- **Explorer Verification**: [Basescan Sepolia Contract Page](https://sepolia.basescan.org/address/0x9A48F9E8cD6F27a8B8b9c8B72e12B4c6198C51E2#code)
- **Compiler**: Solidity `^0.8.20`
- **Security Pattern**: Strictly complies with **Checks-Effects-Interactions (CEI)** pattern and reentrancy guards (`nonReentrant`).

---

## 🔒 Security Architecture: Checks-Effects-Interactions

Every function that moves funds (`releaseFunds`, `reclaimFunds`) adheres to the CEI pattern:

```solidity
function releaseFunds(uint256 _dealId) external nonReentrant {
    // 1. CHECKS
    Deal storage deal = deals[_dealId];
    if (deal.id == 0) revert DealNotFound();
    if (deal.status != DealStatus.Active) revert DealNotActive();
    if (msg.sender != deal.buyer) revert OnlyBuyerAllowed();

    uint256 amountToRelease = deal.amount;
    address payable sellerRecipient = deal.seller;

    // 2. EFFECTS (Storage updated BEFORE external execution)
    deal.status = DealStatus.Released;
    emit DealReleased(_dealId, deal.buyer, sellerRecipient, amountToRelease, block.timestamp);

    // 3. INTERACTIONS (External value transfer)
    (bool success, ) = sellerRecipient.call{value: amountToRelease}("");
    if (!success) revert TransferFailed();
}
```

- **Access Control**: Only the original buyer address can release funds or reclaim after the deadline.
- **Double-spend / Reentrancy Protection**: State is marked `Released` or `Reclaimed` before any ETH transfer occurs.
- **Settlement Immutability**: Any attempts to touch a settled deal revert immediately.

---

## 🛠️ Tech Stack

- **Smart Contract**: Solidity `0.8.20` (`/contracts/Escrow.sol`)
- **Target Network**: Base Sepolia Testnet
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Web3 Layer**: Viem + Wagmi v2 + RainbowKit
- **RPC & Explorer**: Alchemy / Base Public RPC + Basescan Sepolia

---

## 🚀 Environment Variables (`.env.example`)

```env
# Alchemy RPC Key for Base Sepolia (optional, public fallback included)
VITE_ALCHEMY_API_KEY=""

# WalletConnect Project ID for RainbowKit
VITE_WALLETCONNECT_PROJECT_ID="c4f79cc821944d9680842e34466bfbd"

# Deployed Escrow Contract Address on Base Sepolia
VITE_ESCROW_CONTRACT_ADDRESS="0x9A48F9E8cD6F27a8B8b9c8B72e12B4c6198C51E2"

# Deployer credentials for contract deployment (Do not commit secrets)
DEPLOYER_PRIVATE_KEY=""
BASESCAN_API_KEY=""
```

---

## 🧪 How to Test

1. Connect your wallet (MetaMask, Coinbase Wallet, Rainbow, etc.) to **Base Sepolia**.
2. If you need testnet ETH, grab free Base Sepolia ETH from the [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia).
3. Click **Create Deal**, specify a seller address, deposit amount (e.g. 0.001 ETH), and set a deadline (e.g. 15 minutes preset for demo).
4. Approve the transaction in your wallet.
5. Once mined, switch wallets or test releasing payment or reclaiming after the deadline expires.
