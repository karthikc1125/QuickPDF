// The wallet address that receives all payments — replace this before going live.
export const TREASURY_ADDRESS = "0xdCdCCB2F5eb9Ae47c6C4ADA7E2a549a22e27c0e8";

// Hardcoded Sepolia testnet price — 0.01 SepoliaETH for lifetime access (for testing)
export const SEPOLIA_ETH_PRICE = 10000000000000000n; // 0.01 ETH in wei

// Minimal ERC-20 ABI — only the transfer() function we actually call
export const ERC20_TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to",     type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
];

// USDC — official Circle deployments per chain
export const USDC_ADDRESSES = {
  1:        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Ethereum
  137:      "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
  42161:    "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  43114:    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6", // Avalanche
  56:       "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // BSC (18 decimals!)
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Sepolia testnet
};

// USDT — official Tether deployments per chain
export const USDT_ADDRESSES = {
  1:     "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum
  137:   "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon
  42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // Arbitrum
  43114: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", // Avalanche
  56:    "0x55d398326f99059fF775485246999027B3197955", // BSC (18 decimals!)
};

// BSC uses 18-decimal versions of USDC and USDT (Binance-Peg tokens).
// Every other supported chain uses the standard 6 decimals.
const STABLE_18_CHAINS = new Set([56]);
export function getStableDecimals(chainId) { return STABLE_18_CHAINS.has(chainId) ? 18 : 6; }

// Returns undefined if the chain isn't supported, so callers can disable the button
export function getUsdcAddress(chainId) { return USDC_ADDRESSES[chainId]; }
export function getUsdtAddress(chainId) { return USDT_ADDRESSES[chainId]; }
