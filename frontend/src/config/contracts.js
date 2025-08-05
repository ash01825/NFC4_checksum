import TradeAgreementABI from '../contracts/abi/TradeAgreement.json';
import IdentityRegistryABI from '../contracts/abi/IdentityRegistry.json';

// Contract addresses - these will be updated after deployment
export const CONTRACT_ADDRESSES = {
  // These are placeholder addresses - replace with actual deployed addresses
  TRADE_AGREEMENT: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Replace with actual address
  IDENTITY_REGISTRY: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Replace with actual address
};

export const CONTRACT_ABIS = {
  TRADE_AGREEMENT: TradeAgreementABI,
  IDENTITY_REGISTRY: IdentityRegistryABI,
};

// Network configuration
export const NETWORK_CONFIG = {
  chainId: 31337, // Hardhat local network
  chainName: "Hardhat Local",
  rpcUrl: "http://127.0.0.1:8545",
  blockExplorer: null,
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
};

// Trade status mapping
export const TRADE_STATUS = {
  0: "Created",
  1: "Funded", 
  2: "InTransit",
  3: "Completed",
  4: "Cancelled"
};

// ESG metrics structure
export const ESG_METRICS = {
  environmental: {
    carbonFootprint: 0,
    renewableEnergy: 0,
    wasteManagement: 0,
  },
  social: {
    laborStandards: 0,
    communityImpact: 0,
    diversity: 0,
  },
  governance: {
    transparency: 0,
    compliance: 0,
    ethics: 0,
  }
}; 