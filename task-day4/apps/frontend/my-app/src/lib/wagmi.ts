import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

// Ambil dari env (wajib ada di Vercel)
const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL!; // <--- ini yang baru

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors: [
    walletConnect({
      projectId: wcProjectId,
      metadata: {
        name: 'Avalanche dApp',
        description: 'Day 3 Fullstack dApp',
        // Fix: jangan hardcoded localhost, biar dynamic di production
        url: typeof window !== 'undefined' ? window.location.origin : 'https://avalanche-fullstack-byiqbal.vercel.app/',
        icons: ['https://avatars.githubusercontent.com/u/69631'],
      },
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(rpcUrl), // <--- ini kunci utamanya, pake custom RPC
  },
});