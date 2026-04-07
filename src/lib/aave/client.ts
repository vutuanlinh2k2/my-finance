import { ChainId, UiPoolDataProvider } from '@aave/contract-helpers'
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book'
import { ethers } from 'ethers'

export const AAVE_V3_ETHEREUM_DEPLOYMENT_BLOCK = 16_291_127
export const AAVE_V3_ETHEREUM_TX_EXPLORER_BASE_URL = 'https://etherscan.io/tx/'

const ETHEREUM_RPC_URLS = [
  'https://ethereum-rpc.publicnode.com',
  'https://1rpc.io/eth',
  'https://rpc.ankr.com/eth',
  'https://eth.llamarpc.com',
] as const

function createEthereumProvider(): ethers.providers.FallbackProvider {
  const network = {
    chainId: 1,
    name: 'Ethereum Mainnet',
  }

  return new ethers.providers.FallbackProvider(
    ETHEREUM_RPC_URLS.map((url, index) => ({
      provider: new ethers.providers.StaticJsonRpcProvider(url, network),
      priority: index + 1,
      stallTimeout: 1_000,
      weight: 1,
    })),
    1,
  )
}

export const aaveEthereumProvider = createEthereumProvider()

export const aaveEthereumPoolDataProvider = new UiPoolDataProvider({
  uiPoolDataProviderAddress: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
  provider: aaveEthereumProvider,
  chainId: ChainId.mainnet,
})

export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}
