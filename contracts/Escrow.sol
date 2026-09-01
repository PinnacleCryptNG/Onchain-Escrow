// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Trustless Onchain Escrow
 * @notice A decentralized escrow contract on Base Sepolia where buyers lock funds, 
 * sellers deliver goods/services, and buyers release payment. If the deadline expires 
 * without delivery, the buyer can reclaim their locked deposit.
 * @dev Implements strict Checks-Effects-Interactions (CEI) pattern and Reentrancy protection.
 */
contract Escrow {
    // -------------------------------------------------------------------------
    // Custom Errors (Gas-Optimized)
    // -------------------------------------------------------------------------
    error InvalidSeller();
    error ZeroAmount();
    error DeadlineMustBeFuture();
    error DealNotFound();
    error DealNotActive();
    error OnlyBuyerAllowed();
    error DeadlineNotPassed();
    error TransferFailed();
    error ReentrancyGuardReentrantCall();

    // -------------------------------------------------------------------------
    // Data Structures & Enums
    // -------------------------------------------------------------------------
    enum DealStatus {
        Active,     // Funds are locked in the escrow contract
        Released,   // Buyer approved and released funds to the seller
        Reclaimed   // Deadline elapsed and buyer reclaimed their locked funds
    }

    struct Deal {
        uint256 id;
        address payable buyer;
        address payable seller;
        uint256 amount;
        uint256 deadline;
        DealStatus status;
        string title;
        uint256 createdAt;
    }

    // -------------------------------------------------------------------------
    // State Variables
    // -------------------------------------------------------------------------
    uint256 public dealCount;
    mapping(uint256 => Deal) public deals;
    
    // Address indexers for quick onchain frontend lookups
    mapping(address => uint256[]) private userDealIds;

    // Reentrancy lock
    uint256 private _status;
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event DealCreated(
        uint256 indexed dealId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 deadline,
        string title,
        uint256 timestamp
    );

    event DealReleased(
        uint256 indexed dealId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 timestamp
    );

    event DealReclaimed(
        uint256 indexed dealId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------
    modifier nonReentrant() {
        if (_status == _ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }
        _status = _ENTERED;
        _;
        _status = _NOT_ENTERED;
    }

    constructor() {
        _status = _NOT_ENTERED;
    }

    // -------------------------------------------------------------------------
    // Core Functions (Checks-Effects-Interactions)
    // -------------------------------------------------------------------------

    /**
     * @notice Creates a new escrow deal by depositing ETH and naming a seller.
     * @param _seller The counterparty address who will receive funds upon delivery.
     * @param _deadline Unix timestamp after which buyer can reclaim if not satisfied.
     * @param _title Descriptive title or reference for this transaction.
     * @return dealId The unique identifier of the created deal.
     */
    function createDeal(
        address payable _seller,
        uint256 _deadline,
        string calldata _title
    ) external payable returns (uint256 dealId) {
        // 1. CHECKS
        if (_seller == address(0) || _seller == msg.sender) {
            revert InvalidSeller();
        }
        if (msg.value == 0) {
            revert ZeroAmount();
        }
        if (_deadline <= block.timestamp) {
            revert DeadlineMustBeFuture();
        }

        // 2. EFFECTS
        dealCount++;
        dealId = dealCount;

        deals[dealId] = Deal({
            id: dealId,
            buyer: payable(msg.sender),
            seller: _seller,
            amount: msg.value,
            deadline: _deadline,
            status: DealStatus.Active,
            title: _title,
            createdAt: block.timestamp
        });

        userDealIds[msg.sender].push(dealId);
        userDealIds[_seller].push(dealId);

        // 3. LOGGING
        emit DealCreated(
            dealId,
            msg.sender,
            _seller,
            msg.value,
            _deadline,
            _title,
            block.timestamp
        );
    }

    /**
     * @notice Releases locked escrow funds to the seller. Only callable by the buyer.
     * @param _dealId The unique ID of the active deal.
     */
    function releaseFunds(uint256 _dealId) external nonReentrant {
        // 1. CHECKS
        Deal storage deal = deals[_dealId];
        if (deal.id == 0) {
            revert DealNotFound();
        }
        if (deal.status != DealStatus.Active) {
            revert DealNotActive();
        }
        if (msg.sender != deal.buyer) {
            revert OnlyBuyerAllowed();
        }

        uint256 amountToRelease = deal.amount;
        address payable sellerRecipient = deal.seller;
        address buyerAddress = deal.buyer;

        // 2. EFFECTS (State updated BEFORE value transfer)
        deal.status = DealStatus.Released;

        emit DealReleased(
            _dealId,
            buyerAddress,
            sellerRecipient,
            amountToRelease,
            block.timestamp
        );

        // 3. INTERACTIONS
        (bool success, ) = sellerRecipient.call{value: amountToRelease}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    /**
     * @notice Reclaims locked funds back to the buyer if the deadline has passed without release.
     * @param _dealId The unique ID of the active deal.
     */
    function reclaimFunds(uint256 _dealId) external nonReentrant {
        // 1. CHECKS
        Deal storage deal = deals[_dealId];
        if (deal.id == 0) {
            revert DealNotFound();
        }
        if (deal.status != DealStatus.Active) {
            revert DealNotActive();
        }
        if (msg.sender != deal.buyer) {
            revert OnlyBuyerAllowed();
        }
        if (block.timestamp < deal.deadline) {
            revert DeadlineNotPassed();
        }

        uint256 amountToReclaim = deal.amount;
        address payable buyerRecipient = deal.buyer;

        // 2. EFFECTS (State updated BEFORE value transfer)
        deal.status = DealStatus.Reclaimed;

        emit DealReclaimed(
            _dealId,
            buyerRecipient,
            amountToReclaim,
            block.timestamp
        );

        // 3. INTERACTIONS
        (bool success, ) = buyerRecipient.call{value: amountToReclaim}("");
        if (!success) {
            revert TransferFailed();
        }
    }

    // -------------------------------------------------------------------------
    // View Functions
    // -------------------------------------------------------------------------

    /**
     * @notice Returns single deal details by ID.
     */
    function getDeal(uint256 _dealId) external view returns (Deal memory) {
        if (_dealId == 0 || _dealId > dealCount) {
            revert DealNotFound();
        }
        return deals[_dealId];
    }

    /**
     * @notice Returns all deal IDs associated with a user (as buyer or seller).
     */
    function getUserDealIds(address _user) external view returns (uint256[] memory) {
        return userDealIds[_user];
    }

    /**
     * @notice Returns full Deal structs for all deals associated with a user.
     */
    function getUserDeals(address _user) external view returns (Deal[] memory) {
        uint256[] memory ids = userDealIds[_user];
        Deal[] memory userDealsList = new Deal[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            userDealsList[i] = deals[ids[i]];
        }
        return userDealsList;
    }

    /**
     * @notice Returns total number of deals created.
     */
    function getDealCount() external view returns (uint256) {
        return dealCount;
    }

    /**
     * @notice Returns the total ETH currently locked in the escrow contract.
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
