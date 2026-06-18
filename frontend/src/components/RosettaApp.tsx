'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brief,
  EXPLORER,
  IS_DEPLOYED,
  makeWalletClient,
  openBrief,
  reconcileBrief,
  respondBrief,
} from '@/lib/contract';
import { useWallet } from '@/hooks/useWallet';
import { useContractData } from '@/hooks/useContractData';
import { useTransaction, TxPhase } from '@/hooks/useTransaction';
import { useToast } from '@/components/Toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Rite } from '@/components/Rite';
import { ReconciliationRoom } from '@/components/ReconciliationRoom';
import { BriefSlip } from '@/components/BriefSlip';
import { CarveDialog } from '@/components/CarveDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ConsensusStage } from '@/components/ConsensusStage';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { SlipSkeleton } from '@/components/Skeleton';

type Action = 'open' | 'respond' | 'reconcile';

const CONFIRM_BODY = 'This submits a transaction on Bradbury Testnet. Network fees apply. Continue?';

export function RosettaApp() {
  const wallet = useWallet();
  const data = useContractData();
  const tx = useTransaction();
  const toast = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [carve, setCarve] = useState<{ side: 'A' | 'B' } | null>(null);
  const [confirm, setConfirm] = useState<Action | null>(null);
  const [stageOpen, setStageOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const pendingText = useRef<string>('');
  const toastRef = useRef<number | null>(null);
  const actionLabel = useRef<string>('Transaction');

  // focused brief: explicit selection, else first actionable, else newest.
  const focused: Brief | null = useMemo(() => {
    if (!data.briefs.length) return null;
    if (selectedId) {
      const f = data.briefs.find((b) => b.id === selectedId);
      if (f) return f;
    }
    const actionable = data.briefs.find((b) => b.status === 'OPEN' || b.status === 'AWAITING_B');
    return actionable ?? data.briefs[0];
  }, [data.briefs, selectedId]);

  const aligned = useMemo(() => data.briefs.filter((b) => b.alignment === 'ALIGNED').length, [data.briefs]);

  // mirror tx lifecycle into toasts
  useEffect(() => {
    const { phase, hash, error } = tx.state;
    const href = hash ? `${EXPLORER}/tx/${hash}` : undefined;
    if (!toastRef.current) return;
    if (phase === 'submitted' || (phase === 'consensus' && hash)) {
      toast.update(toastRef.current, {
        kind: 'loading',
        message: `${actionLabel.current} set on the stone. Validators deliberating.`,
        href,
        hrefLabel: 'View transaction',
      });
    } else if (phase === 'confirmed') {
      toast.update(toastRef.current, {
        kind: 'success',
        message: `${actionLabel.current} sealed by consensus.`,
        href,
        hrefLabel: 'View transaction',
      });
      toastRef.current = null;
    } else if (phase === 'error') {
      toast.update(toastRef.current, { kind: 'error', message: error ?? 'The transaction failed.', href, hrefLabel: href ? 'View transaction' : undefined });
      toastRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx.state.phase, tx.state.hash]);

  const ensureWallet = useCallback((): boolean => {
    if (!wallet.address) {
      wallet.connect();
      return false;
    }
    if (!wallet.onBradbury) {
      toast.push({ kind: 'info', message: 'Switch your wallet to Bradbury Testnet to transact.' });
      wallet.connect();
      return false;
    }
    return true;
  }, [wallet, toast]);

  const busy = tx.state.phase !== 'idle' && tx.state.phase !== 'confirmed' && tx.state.phase !== 'error';

  const runAction = useCallback(
    async (action: Action) => {
      if (!wallet.address) return;
      const client = makeWalletClient(wallet.address);
      data.setTxInFlight(true);
      tx.reset();
      toastRef.current = toast.push({ kind: 'loading', message: 'Confirm in your wallet.' });

      let send: () => Promise<unknown>;
      if (action === 'open') {
        actionLabel.current = 'Brief';
        send = () => openBrief(client, pendingText.current);
      } else if (action === 'respond') {
        actionLabel.current = 'Answer';
        send = () => respondBrief(client, focused!.id, pendingText.current);
      } else {
        actionLabel.current = 'Reconciliation';
        if (focused) setPendingId(focused.id);
        setStageOpen(true);
        send = () => reconcileBrief(client, focused!.id);
      }

      const res = await tx.run(client, send);
      data.setTxInFlight(false);

      if (res.ok) {
        const focusedId = focused?.id ?? null;
        await data.reload();
        if (action === 'open') {
          // newest brief is first after reload
          const list = await import('@/lib/contract').then((m) => m.fetchBriefs(0)).catch(() => null);
          if (list && list[0]) setSelectedId(list[0].id);
        } else if (focusedId) {
          setSelectedId(focusedId);
        }
      }
      setPendingId(null);
    },
    [wallet.address, data, tx, toast, focused],
  );

  // confirm -> dispatch
  const onConfirm = useCallback(() => {
    const action = confirm;
    setConfirm(null);
    if (!action) return;
    runAction(action);
  }, [confirm, runAction]);

  // dialog submit handlers
  const submitCarve = useCallback(
    (text: string) => {
      const side = carve?.side;
      setCarve(null);
      pendingText.current = text;
      if (!ensureWallet()) return;
      setConfirm(side === 'A' ? 'open' : 'respond');
    },
    [carve, ensureWallet],
  );

  const startOpen = useCallback(() => {
    if (!ensureWallet()) return;
    setCarve({ side: 'A' });
  }, [ensureWallet]);

  const startRespond = useCallback(() => {
    if (!ensureWallet()) return;
    setCarve({ side: 'B' });
  }, [ensureWallet]);

  const startReconcile = useCallback(() => {
    if (!ensureWallet()) return;
    setConfirm('reconcile');
  }, [ensureWallet]);

  const stale = data.lastLoaded > 0 && Date.now() - data.lastLoaded > 120_000;

  return (
    <div className="relative flex min-h-[100dvh] flex-col">
      <Header wallet={wallet} />

      <main className="relative z-10 flex-1">
        {/* intro + client-derived stats band */}
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[11px] uppercase tracking-[0.28em] text-gold"
          >
            On-chain intent reconciliation
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="engrave mx-auto mt-3 max-w-3xl font-display text-4xl leading-[1.1] text-ink sm:text-5xl"
          >
            Two people describe the same thing. One stone holds the reconciled truth.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl font-body text-[15px] leading-relaxed text-muted"
          >
            Each side writes their own version, blind. A Mediator weaves them into a single
            specification and marks every real divergence, settled by validator consensus.
          </motion.p>

          <div className="mt-8 flex items-center justify-center gap-8">
            <Stat label="Briefs opened" value={data.stats.briefs} />
            <div className="h-8 w-px bg-white/8" />
            <Stat label="Reconciled" value={data.stats.reconciled} />
            <div className="h-8 w-px bg-white/8" />
            <Stat label="Fully aligned" value={aligned} />
          </div>
        </section>

        {/* the reconciliation room: the live brief data is the hero */}
        <section className="mx-auto max-w-5xl px-5 py-6">
          {!IS_DEPLOYED || data.error === 'not-deployed' ? (
            <ErrorState
              message="No contract is configured yet."
              onRetry={() => data.reload(true)}
            />
          ) : data.loading ? (
            <SlipSkeleton />
          ) : data.error ? (
            <ErrorState message={data.error} onRetry={() => data.reload(true)} />
          ) : focused ? (
            <>
              {stale && (
                <p className="mb-3 text-center font-mono text-[11px] text-faint">
                  Showing data from over two minutes ago. The board refreshes on its own.
                </p>
              )}
              <ReconciliationRoom
                brief={focused}
                walletAddress={wallet.address}
                busy={busy}
                onRespond={startRespond}
                onReconcile={startReconcile}
                onOpenNew={startOpen}
              />
            </>
          ) : (
            <EmptyState onOpen={startOpen} canOpen={!!wallet.hasProvider} />
          )}
        </section>

        {/* the ledger of all briefs */}
        {focused && data.briefs.length > 0 && (
          <section className="mx-auto max-w-5xl px-5 py-10">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl text-ink">The reconciliation ledger</h3>
              <span className="font-mono text-[11px] text-faint">{data.briefs.length} on the stone</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.briefs.map((b) => (
                <BriefSlip
                  key={b.id}
                  brief={b}
                  active={focused.id === b.id}
                  pending={pendingId === b.id}
                  onSelect={() => {
                    setSelectedId(b.id);
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <Rite />
      </main>

      <Footer />

      {/* dialogs */}
      <CarveDialog
        open={carve?.side === 'A'}
        side="A"
        title="Open a new brief"
        hint="Describe, in your own words, the thing you intend. A second voice will answer separately, and the Mediator will reconcile the two."
        placeholder="A weekly team sync every Tuesday at 10am for thirty minutes, where each person shares progress and blockers."
        busy={busy}
        onSubmit={submitCarve}
        onCancel={() => setCarve(null)}
      />
      <CarveDialog
        open={carve?.side === 'B'}
        side="B"
        title="Answer as party B"
        hint="Describe the same thing from scratch, in your own words. Do not try to match side A: the point is to see where two independent readings truly diverge."
        placeholder="A short Tuesday morning standup, about half an hour, where everyone gives a quick update on what they did and what is stuck."
        busy={busy}
        onSubmit={submitCarve}
        onCancel={() => setCarve(null)}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === 'reconcile' ? 'Reconcile the two voices?' : confirm === 'respond' ? 'Seat your answer?' : 'Open this brief?'}
        body={CONFIRM_BODY}
        confirmLabel={confirm === 'reconcile' ? 'Reconcile' : 'Continue'}
        onConfirm={onConfirm}
        onCancel={() => setConfirm(null)}
      />

      <ConsensusStage
        open={stageOpen}
        phase={tx.state.phase as TxPhase}
        liveStatus={tx.state.liveStatus}
        draft={tx.state.draft}
        hash={tx.state.hash}
        error={tx.state.error}
        partyA={focused?.party_a ?? ''}
        partyB={focused?.party_b ?? ''}
        onClose={() => {
          setStageOpen(false);
          tx.reset();
        }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="tabnum font-display text-3xl text-gold">{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">{label}</p>
    </div>
  );
}
