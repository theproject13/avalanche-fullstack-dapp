import { createConfig, http } from 'wagmi';
import { avalancheFuji } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

const wcProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors: [
    walletConnect({
      projectId: wcProjectId,
      metadata: {
        name: 'Avalanche dApp',
        description: 'Day 3 Fullstack dApp',
        url: 'http://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/69631'],
      },
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
});
