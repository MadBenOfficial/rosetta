'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ExternalLink, Loader, X } from 'lucide-react';
import { EXPLORER, LeaderDraft, statusName } from '@/lib/contract';
import type { TxPhase } from '@/hooks/useTransaction';

const STAGES = [
  { key: 'carve', label: 'Carving the request', match: ['WALLET'] },
  { key: 'submit', label: 'Set on the stone', match: ['SUBMITTED', 'PENDING'] },
  { key: 'weave', label: 'Mediator weaving the seam', match: ['PROPOSING', 'COMMITTING', 'REVEALING'] },
  { key: 'seal', label: 'Sealed by consensus', match: ['ACCEPTED', 'FINALIZED'] },
] as const;

function stageIndex(phase: TxPhase, status: string): number {
  if (phase === 'wallet') return 0;
  if (phase === 'submitted') return 1;
  if (phase === 'confirmed') return 3;
  if (phase === 'consensus') {
    if (['PROPOSING', 'COMMITTING', 'REVEALING'].includes(status)) return 2;
    if (['ACCEPTED', 'FINALIZED'].includes(status)) return 3;
    return 1;
  }
  return 0;
}

export interface StageProps {
  open: boolean;
  phase: TxPhase;
  liveStatus: string;
  draft: LeaderDraft | null;
  hash: `0x${string}` | null;
  error: string | null;
  partyA: string;
  partyB: string;
  onClose: () => void;
}

export function ConsensusStage({ open, phase, liveStatus, draft, hash, error, partyA, partyB, onClose }: StageProps) {
  const active = stageIndex(phase, liveStatus);
  const rotating = liveStatus === 'LEADER_TIMEOUT' || liveStatus === 'VALIDATORS_TIMEOUT';
  const done = phase === 'confirmed';
  const failed = phase === 'error';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-0 backdrop-blur-md sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex h-full w-full max-w-3xl flex-col slab-shell sm:h-auto"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="slab-core flex h-full flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                  Reconciliation in progress
                </span>
                {(done || failed) && (
                  <button onClick={onClose} aria-label="Close" className="text-faint hover:text-ink">
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-6">
                {/* the weaving stage: two columns into a seam */}
                <div className="relative grid grid-cols-[1fr_2px_1fr] gap-5">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ochre">Party A</p>
                    <p className="line-clamp-6 font-body text-[12.5px] leading-relaxed text-muted">{partyA}</p>
                  </div>
                  <div className="relative">
                    <div className="seam-line absolute inset-y-0 left-1/2 w-px -translate-x-1/2 animate-seam-pulse" />
                  </div>
                  <div>
                    <p className="mb-2 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">Party B</p>
                    <p className="line-clamp-6 text-right font-body text-[12.5px] leading-relaxed text-muted">{partyB}</p>
                  </div>
                </div>

                {/* the forming reconciled column + divergence margin (leader peek) */}
                <div className="mt-7 grid grid-cols-[1fr_auto] gap-4">
                  <div className="slab-shell">
                    <div className="slab-core min-h-[96px] p-4">
                      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        Reconciled seam {draft?.reconciled_spec ? '(leader draft)' : ''}
                      </p>
                      {draft?.reconciled_spec ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="font-body text-[13px] leading-relaxed text-ink"
                        >
                          {draft.reconciled_spec}
                        </motion.p>
                      ) : (
                        <p className="font-body text-[13px] italic leading-relaxed text-faint">
                          {rotating
                            ? 'Validators rotating the lead mediator, still weaving.'
                            : 'The mediator is reading both descriptions and weaving a single specification.'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex w-28 flex-col items-center justify-center slab-shell">
                    <div className="slab-core flex w-full flex-col items-center px-2 py-4">
                      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-faint">Divergences</span>
                      <span className="tabnum mt-1 font-display text-3xl text-gold">
                        {draft?.divergence_count !== undefined ? draft.divergence_count : '\u2013'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* divergences popping into the margin */}
                {draft?.divergences && draft.divergences.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <AnimatePresence>
                      {draft.divergences.map((d, i) => (
                        <motion.div
                          key={`${i}-${d.slice(0, 12)}`}
                          initial={{ opacity: 0, x: 18 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2 rounded-sm border border-white/5 bg-white/[0.02] px-3 py-1.5"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                          <span className="font-body text-[12px] leading-snug text-muted">{d}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* stage rail */}
                <div className="mt-8 flex flex-col gap-2.5">
                  {STAGES.map((s, i) => {
                    const state = failed && i >= active ? 'fail' : i < active || done ? 'done' : i === active ? 'live' : 'wait';
                    return (
                      <div key={s.key} className="flex items-center gap-3">
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                            state === 'done'
                              ? 'border-cyan/50 bg-cyan/15 text-cyan'
                              : state === 'live'
                                ? 'border-gold/50 bg-gold/15 text-gold'
                                : state === 'fail'
                                  ? 'border-danger/50 bg-danger/15 text-danger'
                                  : 'border-white/10 text-faint'
                          }`}
                        >
                          {state === 'done' ? <Check size={11} /> : state === 'live' ? <Loader size={11} className="animate-spin" /> : i + 1}
                        </span>
                        <span className={`font-mono text-[12px] ${state === 'wait' ? 'text-faint' : 'text-ink'}`}>
                          {s.label}
                        </span>
                        {i === active && !done && !failed && (
                          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                            {statusName(liveStatus)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {failed && error && (
                  <p className="mt-5 rounded-sm border border-danger/30 bg-danger/10 px-4 py-3 font-body text-[13px] text-danger">
                    {error}
                  </p>
                )}

                {hash && (
                  <a
                    href={`${EXPLORER}/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] text-gold underline decoration-dotted underline-offset-2"
                  >
                    <ExternalLink size={12} />
                    Follow this transaction on the explorer
                  </a>
                )}
              </div>

              {(done || failed) && (
                <div className="border-t border-white/5 px-5 py-3.5">
                  <button
                    onClick={onClose}
                    className="w-full rounded-sm border border-gold/30 bg-gold/10 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-all hover:bg-gold/20 active:scale-[0.99]"
                  >
                    {done ? 'Read the sealed reconciliation' : 'Close and retry'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
