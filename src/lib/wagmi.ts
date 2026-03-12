import { http, createConfig } from "wagmi";
import { arbitrum, base, mainnet, optimism, polygon } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "demo-project-id";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
        rainbowWallet,
      ],
    },
  ],
  {
    appName: "Sovereign Mint",
    projectId,
  }
);

export const config = createConfig({
  connectors,
  chains: [mainnet, optimism, polygon, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
