'use client';

import { useCallback, useRef, useState } from 'react';
import {
  LeaderDraft,
  WalletClient,
  friendlyError,
  pollUntilDecided,
} from '@/lib/contract';

export type TxPhase = 'idle' | 'wallet' | 'submitted' | 'consensus' | 'confirmed' | 'error';

export interface TxState {
  phase: TxPhase;
  hash: `0x${string}` | null;
  liveStatus: string;
  draft: LeaderDraft | null;
  error: string | null;
}

const INITIAL: TxState = {
  phase: 'idle',
  hash: null,
  liveStatus: '',
  draft: null,
  error: null,
};

export function useTransaction() {
  const [state, setState] = useState<TxState>(INITIAL);
  const busy = useRef(false);

  const reset = useCallback(() => {
    busy.current = false;
    setState(INITIAL);
  }, []);

  // send: a function that submits and returns the tx hash.
  const run = useCallback(
    async (
      client: WalletClient,
      send: () => Promise<unknown>,
    ): Promise<{ ok: boolean; status: string; draft: LeaderDraft | null }> => {
      if (busy.current) return { ok: false, status: 'BUSY', draft: null };
      busy.current = true;
      setState({ ...INITIAL, phase: 'wallet' });
      try {
        const hash = (await send()) as `0x${string}`;
        setState((s) => ({ ...s, phase: 'submitted', hash }));
        setState((s) => ({ ...s, phase: 'consensus', liveStatus: 'PENDING' }));
        const { status, draft } = await pollUntilDecided(client, hash, (st, dr) => {
          setState((s) => ({ ...s, liveStatus: st, draft: dr ?? s.draft }));
        });
        if (status === 'ACCEPTED' || status === 'FINALIZED') {
          setState((s) => ({ ...s, phase: 'confirmed', liveStatus: status, draft: draft ?? s.draft }));
          busy.current = false;
          return { ok: true, status, draft };
        }
        setState((s) => ({
          ...s,
          phase: 'error',
          liveStatus: status,
          error:
            status === 'UNDETERMINED'
              ? 'The validators could not converge on this reconciliation. Try again.'
              : status === 'TIMEOUT'
                ? 'The network is congested. The reconciliation may still settle; check again shortly.'
                : `The transaction ended as ${status}.`,
        }));
        busy.current = false;
        return { ok: false, status, draft };
      } catch (e) {
        setState((s) => ({ ...s, phase: 'error', error: friendlyError(e) }));
        busy.current = false;
        return { ok: false, status: 'ERROR', draft: null };
      }
    },
    [],
  );

  return { state, run, reset };
}
