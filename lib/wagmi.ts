import { createConfig, http } from "wagmi";
import { arbitrum, arbitrumSepolia, mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, arbitrum, arbitrumSepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [arbitrumSepolia.id]: http("https://sepolia-rollup.arbitrum.io/rpc"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
