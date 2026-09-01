export const ESCROW_ABI = [
  {
    type: "constructor",
    inputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "error",
    name: "DeadlineMustBeFuture",
    inputs: []
  },
  {
    type: "error",
    name: "DeadlineNotPassed",
    inputs: []
  },
  {
    type: "error",
    name: "DealNotActive",
    inputs: []
  },
  {
    type: "error",
    name: "DealNotFound",
    inputs: []
  },
  {
    type: "error",
    name: "InvalidSeller",
    inputs: []
  },
  {
    type: "error",
    name: "OnlyBuyerAllowed",
    inputs: []
  },
  {
    type: "error",
    name: "ReentrancyGuardReentrantCall",
    inputs: []
  },
  {
    type: "error",
    name: "TransferFailed",
    inputs: []
  },
  {
    type: "error",
    name: "ZeroAmount",
    inputs: []
  },
  {
    type: "event",
    name: "DealCreated",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "buyer", type: "address", indexed: true, internalType: "address" },
      { name: "seller", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "deadline", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "title", type: "string", indexed: false, internalType: "string" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DealReleased",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "buyer", type: "address", indexed: true, internalType: "address" },
      { name: "seller", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "DealReclaimed",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "buyer", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
      { name: "timestamp", type: "uint256", indexed: false, internalType: "uint256" }
    ],
    anonymous: false
  },
  {
    type: "function",
    name: "createDeal",
    inputs: [
      { name: "_seller", type: "address", internalType: "address payable" },
      { name: "_deadline", type: "uint256", internalType: "uint256" },
      { name: "_title", type: "string", internalType: "string" }
    ],
    outputs: [
      { name: "dealId", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "dealCount",
    inputs: [],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "deals",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      { name: "buyer", type: "address", internalType: "address payable" },
      { name: "seller", type: "address", internalType: "address payable" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "deadline", type: "uint256", internalType: "uint256" },
      { name: "status", type: "uint8", internalType: "enum Escrow.DealStatus" },
      { name: "title", type: "string", internalType: "string" },
      { name: "createdAt", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getContractBalance",
    inputs: [],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getDeal",
    inputs: [
      { name: "_dealId", type: "uint256", internalType: "uint256" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct Escrow.Deal",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "buyer", type: "address", internalType: "address payable" },
          { name: "seller", type: "address", internalType: "address payable" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum Escrow.DealStatus" },
          { name: "title", type: "string", internalType: "string" },
          { name: "createdAt", type: "uint256", internalType: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getDealCount",
    inputs: [],
    outputs: [
      { name: "", type: "uint256", internalType: "uint256" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserDealIds",
    inputs: [
      { name: "_user", type: "address", internalType: "address" }
    ],
    outputs: [
      { name: "", type: "uint256[]", internalType: "uint256[]" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserDeals",
    inputs: [
      { name: "_user", type: "address", internalType: "address" }
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct Escrow.Deal[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          { name: "buyer", type: "address", internalType: "address payable" },
          { name: "seller", type: "address", internalType: "address payable" },
          { name: "amount", type: "uint256", internalType: "uint256" },
          { name: "deadline", type: "uint256", internalType: "uint256" },
          { name: "status", type: "uint8", internalType: "enum Escrow.DealStatus" },
          { name: "title", type: "string", internalType: "string" },
          { name: "createdAt", type: "uint256", internalType: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "reclaimFunds",
    inputs: [
      { name: "_dealId", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "releaseFunds",
    inputs: [
      { name: "_dealId", type: "uint256", internalType: "uint256" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  }
] as const;
