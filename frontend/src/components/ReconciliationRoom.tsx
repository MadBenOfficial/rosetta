'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Plus, ScrollText } from 'lucide-react';
import { Brief } from '@/lib/contract';
import { briefLabel, copyText, shortAddr } from '@/lib/format';

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        if (await copyText(value)) {
          setDone(true);
          setTimeout(() => setDone(false), 1400);
        }
      }}
      className="flex items-center gap-1 font-mono text-[10px] text-faint transition-colors hover:text-gold"
    >
      {done ? <Check size={11} className="text-cyan" /> : <Copy size={11} />}
      {done ? 'Copied' : label}
    </button>
  );
}

export interface RoomProps {
  brief: Brief;
  walletAddress: string | null;
  busy: boolean;
  onRespond: () => void;
  onReconcile: () => void;
  onOpenNew: () => void;
}

export function ReconciliationRoom({ brief, walletAddress, busy, onRespond, onReconcile, onOpenNew }: RoomProps) {
  const isA = walletAddress && walletAddress.toLowerCase() === brief.a_addr.toLowerCase();
  const reconciled = brief.status === 'RECONCILED';
  const aligned = brief.alignment === 'ALIGNED';

  return (
    <div className="slab-shell">
      <div className="slab-core overflow-hidden">
        {/* slip header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <ScrollText size={16} className="text-gold" />
            <span className="font-mono text-[12px] uppercase tracking-[0.18em] text-ink">
              {briefLabel(brief.id)}
            </span>
            {reconciled && (
              <span
                className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  aligned ? 'border-cyan/40 bg-cyan/10 text-cyan' : 'border-gold/40 bg-gold/10 text-gold'
                }`}
              >
                {aligned ? 'Aligned' : 'Divergent'}
              </span>
            )}
          </div>
          <button
            onClick={onOpenNew}
            className="flex items-center gap-1.5 rounded-sm border border-ochre/30 bg-ochre/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ochre transition-all hover:bg-ochre/20 active:scale-[0.98]"
          >
            <Plus size={13} />
            New brief
          </button>
        </div>

        {/* the two tablets with a central seam */}
        <div className="relative grid grid-cols-1 md:grid-cols-[1fr_3px_1fr]">
          {/* party A */}
          <div className="p-5 md:p-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ochre">Party A</span>
              <span className="font-mono text-[10px] text-faint">{shortAddr(brief.a_addr)}</span>
            </div>
            <p className="engrave whitespace-pre-wrap font-display text-[17px] leading-relaxed text-ink">
              {brief.party_a}
            </p>
          </div>

          {/* central seam */}
          <div className="relative hidden md:block">
            <div className="seam-line absolute inset-y-4 left-1/2 w-px -translate-x-1/2" />
            {reconciled && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-gold/40 bg-basalt">
                  <span className="tabnum font-display text-xl leading-none text-gold">{brief.divergence_count}</span>
                  <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-faint">diverge</span>
                </div>
              </div>
            )}
          </div>

          {/* party B */}
          <div className="border-t border-white/5 p-5 md:border-l-0 md:border-t-0 md:p-7">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">Party B</span>
              {brief.b_addr && <span className="font-mono text-[10px] text-faint">{shortAddr(brief.b_addr)}</span>}
            </div>
            {brief.party_b ? (
              <p className="engrave whitespace-pre-wrap font-display text-[17px] leading-relaxed text-ink md:text-right">
                {brief.party_b}
              </p>
            ) : (
              <div className="flex flex-col items-start gap-3 md:items-end">
                <p className="font-body text-[14px] leading-relaxed text-faint md:text-right">
                  No second voice yet. A different account can answer with their own description of the
                  same thing, blind to side A.
                </p>
                {!isA && (
                  <button
                    onClick={onRespond}
                    disabled={busy}
                    className="rounded-sm border border-cyan/40 bg-cyan/10 px-4 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-cyan transition-all hover:bg-cyan/20 active:scale-[0.98] disabled:opacity-50"
                  >
                    Answer as party B
                  </button>
                )}
                {isA && (
                  <p className="font-mono text-[11px] text-faint md:text-right">
                    You opened side A. A second account must seat side B.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* the seam result / action */}
        {brief.status === 'OPEN' && (
          <div className="border-t border-white/5 px-5 py-6 text-center">
            <p className="mx-auto mb-4 max-w-md font-body text-[13.5px] leading-relaxed text-muted">
              Both voices are carved. Let the Mediator read them together, weave one reconciled
              specification, and mark every real divergence.
            </p>
            <button
              onClick={onReconcile}
              disabled={busy}
              className="rounded-sm border border-gold/40 bg-gold/15 px-6 py-2.5 font-mono text-[12px] uppercase tracking-[0.16em] text-gold transition-all hover:bg-gold/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Reconciling' : 'Reconcile the two voices'}
            </button>
          </div>
        )}

        {reconciled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-t border-gold/15 bg-gold/[0.02] px-5 py-6 md:px-7"
          >
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    Reconciled specification
                  </span>
                  {brief.reconciled_spec && <CopyBtn value={brief.reconciled_spec} label="Copy spec" />}
                </div>
                <p className="whitespace-pre-wrap font-body text-[15px] leading-relaxed text-ink">
                  {brief.reconciled_spec || 'The two descriptions resolved without a written merge.'}
                </p>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
                  Divergence margin
                </span>
                {brief.divergences.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1.5">
                    {brief.divergences.map((d, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 rounded-sm border border-white/5 bg-white/[0.02] px-3 py-1.5"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan" />
                        <span className="font-body text-[12.5px] leading-snug text-muted">{d}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 font-body text-[13px] italic leading-relaxed text-faint">
                    No real disagreements. The two voices meant the same thing.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
