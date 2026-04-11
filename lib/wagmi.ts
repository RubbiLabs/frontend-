import { createConfig, http } from "wagmi";
import { mainnet, monad } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const monadTestnet = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
} as const;

export const config = createConfig({
  chains: [mainnet, monad, monadTestnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [monad.id]: http("https://rpc.monad.xyz"),
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}