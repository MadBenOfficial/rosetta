'use client';

import { useCallback, useEffect, useState } from 'react';
import { BRADBURY_PARAMS } from '@/lib/contract';

type Eth = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
};

function getEth(): Eth | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { ethereum?: Eth }).ethereum ?? null;
}

export interface WalletState {
  address: `0x${string}` | null;
  chainId: string | null;
  connecting: boolean;
  hasProvider: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    connecting: false,
    hasProvider: false,
    error: null,
  });

  useEffect(() => {
    setState((s) => ({ ...s, hasProvider: !!getEth() }));
  }, []);

  const refreshChain = useCallback(async () => {
    const eth = getEth();
    if (!eth) return;
    try {
      const cid = (await eth.request({ method: 'eth_chainId' })) as string;
      setState((s) => ({ ...s, chainId: cid }));
    } catch {
      /* ignore */
    }
  }, []);

  const connect = useCallback(async () => {
    const eth = getEth();
    if (!eth) {
      setState((s) => ({ ...s, error: 'No wallet detected. Install MetaMask to transact.' }));
      return;
    }
    setState((s) => ({ ...s, connecting: true, error: null }));
    try {
      const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as string[];
      try {
        await eth.request({ method: 'wallet_addEthereumChain', params: [BRADBURY_PARAMS] });
      } catch {
        /* chain may already exist */
      }
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BRADBURY_PARAMS.chainId }],
        });
      } catch {
        /* user may decline switch */
      }
      const cid = (await eth.request({ method: 'eth_chainId' })) as string;
      setState({
        address: (accounts[0] ?? null) as `0x${string}` | null,
        chainId: cid,
        connecting: false,
        hasProvider: true,
        error: null,
      });
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e);
      setState((s) => ({
        ...s,
        connecting: false,
        error: /reject|denied|4001/i.test(msg) ? 'You cancelled the connection.' : 'Could not connect to the wallet.',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState((s) => ({ ...s, address: null }));
  }, []);

  useEffect(() => {
    const eth = getEth();
    if (!eth?.on) return;
    const onAccounts = (...args: unknown[]) => {
      const accts = (args[0] as string[]) ?? [];
      setState((s) => ({ ...s, address: (accts[0] ?? null) as `0x${string}` | null }));
    };
    const onChain = (...args: unknown[]) => {
      setState((s) => ({ ...s, chainId: (args[0] as string) ?? null }));
    };
    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);
    return () => {
      eth.removeListener?.('accountsChanged', onAccounts);
      eth.removeListener?.('chainChanged', onChain);
    };
  }, []);

  const onBradbury = state.chainId
    ? state.chainId.toLowerCase() === BRADBURY_PARAMS.chainId.toLowerCase()
    : false;

  return { ...state, onBradbury, connect, disconnect, refreshChain };
}
