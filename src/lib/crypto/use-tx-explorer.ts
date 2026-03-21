import { useCallback, useState } from 'react'

import { buildExplorerUrl, detectChainFromUrl } from './chains'

import { sanitizeUrl } from '@/lib/subscriptions/utils'

export type TxExplorerMode = 'raw' | 'generated'

interface UseTxExplorerOptions {
  initialTxId?: string
  initialTxExplorerUrl?: string
}

function resolveInitialState(options?: UseTxExplorerOptions) {
  const txId = options?.initialTxId ?? ''

  if (options?.initialTxExplorerUrl) {
    const detected = detectChainFromUrl(options.initialTxExplorerUrl)
    if (detected) {
      return {
        txId: txId || detected.txHash,
        mode: 'generated' as TxExplorerMode,
        selectedChain: detected.chainId,
        rawUrl: '',
      }
    }
    return {
      txId,
      mode: 'raw' as TxExplorerMode,
      selectedChain: '',
      rawUrl: options.initialTxExplorerUrl,
    }
  }

  return {
    txId,
    mode: 'generated' as TxExplorerMode,
    selectedChain: '',
    rawUrl: '',
  }
}

export function useTxExplorer(options?: UseTxExplorerOptions) {
  const initial = resolveInitialState(options)

  const [txId, setTxId] = useState(initial.txId)
  const [mode, setMode] = useState<TxExplorerMode>(initial.mode)
  const [selectedChain, setSelectedChain] = useState(initial.selectedChain)
  const [rawUrl, setRawUrl] = useState(initial.rawUrl)

  const resolveExplorerUrl = useCallback(():
    | string
    | null
    | undefined => {
    if (mode === 'raw') {
      const trimmed = rawUrl.trim()
      return trimmed ? sanitizeUrl(trimmed) : undefined
    }
    return buildExplorerUrl(selectedChain, txId) ?? undefined
  }, [mode, rawUrl, selectedChain, txId])

  return {
    txId,
    setTxId,
    mode,
    setMode,
    selectedChain,
    setSelectedChain,
    rawUrl,
    setRawUrl,
    resolveExplorerUrl,
  }
}
