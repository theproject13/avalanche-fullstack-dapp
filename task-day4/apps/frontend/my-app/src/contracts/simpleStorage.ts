export const SIMPLE_STORAGE_ABI = [
  {
    name: 'getValue',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'setValue',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: '_value', type: 'uint256' }],
    outputs: [],
  },
] as const;
