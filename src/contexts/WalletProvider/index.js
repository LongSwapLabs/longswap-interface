import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet } from 'wagmi/chains'
import { WagmiProvider } from 'wagmi'
import { injected } from 'wagmi/connectors'

const queryClient = new QueryClient()

bsc.rpcUrls.default.http = ['https://bsc-dataseed1.bnbchain.org', 'https://bsc-dataseed2.defibit.io']

export const config = createConfig({
  chains: [bsc],
  connectors: [
    injected()
  ],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
})

function WalletProvider({children}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default WalletProvider