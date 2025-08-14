// 智能合约配置文件

// DeciCourt 合约 ABI
export const DECICOURT_ABI = [
  {
    "inputs": [],
    "name": "registerAsJuror",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unregisterAsJuror",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_defendant", "type": "address"},
      {"internalType": "string", "name": "_evidenceCID", "type": "string"}
    ],
    "name": "createCase",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"},
      {"internalType": "bytes32", "name": "_voteHash", "type": "bytes32"}
    ],
    "name": "commitVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"},
      {"internalType": "uint8", "name": "_vote", "type": "uint8"},
      {"internalType": "bytes32", "name": "_salt", "type": "bytes32"}
    ],
    "name": "revealVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"}
    ],
    "name": "executeVerdict",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"}
    ],
    "name": "appeal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "jurorsInfo",
    "outputs": [
      {"internalType": "bool", "name": "isRegistered", "type": "bool"},
      {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
      {"internalType": "bool", "name": "isServing", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "name": "cases",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "plaintiff", "type": "address"},
      {"internalType": "address", "name": "defendant", "type": "address"},
      {"internalType": "string", "name": "evidenceCID", "type": "string"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "filingFee", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nextCaseId",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "filingFeeAmount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jurorStakeAmount",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"}
    ],
    "name": "getCaseJurors",
    "outputs": [
      {"internalType": "address[]", "name": "", "type": "address[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_caseId", "type": "uint256"}
    ],
    "name": "getCaseDetails",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "address", "name": "plaintiff", "type": "address"},
      {"internalType": "address", "name": "defendant", "type": "address"},
      {"internalType": "string", "name": "evidenceCID", "type": "string"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "filingFee", "type": "uint256"},
      {"internalType": "uint256", "name": "plaintiffVoteCount", "type": "uint256"},
      {"internalType": "uint256", "name": "defendantVoteCount", "type": "uint256"},
      {"internalType": "uint256", "name": "creationTime", "type": "uint256"},
      {"internalType": "uint256", "name": "commitDeadline", "type": "uint256"},
      {"internalType": "uint256", "name": "revealDeadline", "type": "uint256"},
      {"internalType": "address", "name": "winner", "type": "address"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_juror", "type": "address"}
    ],
    "name": "getJurorReputation",
    "outputs": [
      {"internalType": "uint256", "name": "correctVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "totalVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "reputationScore", "type": "uint256"},
      {"internalType": "uint256", "name": "consecutiveWrong", "type": "uint256"},
      {"internalType": "uint256", "name": "accuracyRate", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// JuryToken 合约 ABI
export const JURY_TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "spender", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [
      {"internalType": "bool", "name": "", "type": "bool"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "account", "type": "address"}
    ],
    "name": "balanceOf",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// 合约地址和网络配置
export const CONTRACT_CONFIG = {
  DECICOURT_ADDRESS: process.env.NEXT_PUBLIC_DECI_COURT_ADDRESS || '0x4A679253410272dd5232B3Ff7cF5dbB88f295319',
  JURY_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_JURY_TOKEN_ADDRESS || '0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f',
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545',
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '31337')
};

// 案件状态枚举
export const CASE_STATUS = {
  CREATED: 0,
  VOTING: 1,
  RESOLVING: 2,
  RESOLVED: 3,
  APPEALING: 4,
  APPEAL_RESOLVED: 5
};

// 投票选项枚举
export const VOTE_OPTION = {
  NONE: 0,
  FOR_PLAINTIFF: 1,
  FOR_DEFENDANT: 2
};