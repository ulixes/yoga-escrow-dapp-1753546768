import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Yoga Class Booking',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '2f5a2129ab3b1c9e8b7d5f4e3c2a1b0d',
  chains: [arbitrumSepolia],
  ssr: false,
});