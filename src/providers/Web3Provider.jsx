import "@rainbow-me/rainbowkit/styles.css";

import React from "react";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, bsc, avalanche, arbitrum, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = getDefaultConfig({
  appName:   "QuickPDF",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains:    [mainnet, polygon, bsc, avalanche, arbitrum, sepolia],
  ssr:       false,
});

const queryClient = new QueryClient();

const quickpdfTheme = darkTheme({
  accentColor:           "#ffffff",
  accentColorForeground: "#000000",
  borderRadius:          "large",
  fontStack:             "system",
  overlayBlur:           "small",
});

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={quickpdfTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
